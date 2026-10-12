package com.event.storm.task.infrastructure.parser;

import com.event.storm.task.core.models.intent.SearchIntent;
import com.event.storm.task.core.models.intent.enums.DomainType;
import com.event.storm.task.core.models.offer.Offer;
import com.event.storm.task.core.models.offer.Price;
import com.event.storm.task.core.models.offer.TransportOffer;
import com.event.storm.task.core.models.offer.enums.Currency;
import com.event.storm.task.core.models.offer.enums.Source;
import com.event.storm.task.core.models.route.GeoPoint;
import com.event.storm.task.core.models.route.Location;
import com.event.storm.task.core.port.SearchProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
@Component
public class AtlasProvider implements SearchProvider {

    private static final String STATIONS_RESOURCE = "stations_by.json";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final ZoneId ZONE = ZoneId.systemDefault();
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

    private static final Map<String, String> TRANSLIT_THREE = Map.of(
            "shch", "щ",
            "sch", "щ");

    private static final Map<String, String> TRANSLIT_TWO = Map.ofEntries(
            Map.entry("yo", "ё"), Map.entry("jo", "ё"),
            Map.entry("zh", "ж"), Map.entry("kh", "х"),
            Map.entry("ch", "ч"), Map.entry("sh", "ш"),
            Map.entry("yu", "ю"), Map.entry("ju", "ю"),
            Map.entry("ya", "я"), Map.entry("ja", "я"),
            Map.entry("ye", "е"), Map.entry("je", "е"),
            Map.entry("ts", "ц"));

    private static final Map<Character, String> TRANSLIT_ONE = Map.ofEntries(
            Map.entry('a', "а"), Map.entry('b', "б"), Map.entry('v', "в"),
            Map.entry('g', "г"), Map.entry('d', "д"), Map.entry('e', "е"),
            Map.entry('z', "з"), Map.entry('i', "и"), Map.entry('k', "к"),
            Map.entry('l', "л"), Map.entry('m', "м"), Map.entry('n', "н"),
            Map.entry('o', "о"), Map.entry('p', "п"), Map.entry('r', "р"),
            Map.entry('s', "с"), Map.entry('t', "т"), Map.entry('u', "у"),
            Map.entry('f', "ф"), Map.entry('h', "х"), Map.entry('c', "к"),
            Map.entry('y', "й"), Map.entry('w', "в"), Map.entry('x', "кс"),
            Map.entry('q', "к"), Map.entry('\'', "ь"));

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String searchPath;
    private final String locale;
    private final String projectIdentifier;
    private final String applicationSource;
    private final int fuzzyMaxDistance;
    private final List<Station> stations;
    private final TreeMap<String, List<Station>> byNormalizedName;

    public AtlasProvider(RestClient.Builder restClientBuilder,
                         ObjectMapper objectMapper,
                         @Value("${app.atlas.base-url:https://atlasbus.by}") String baseUrl,
                         @Value("${app.atlas.search-path:/api/search}") String searchPath,
                         @Value("${app.atlas.locale:ru}") String locale,
                         @Value("${app.atlas.project-identifier:morda}") String projectIdentifier,
                         @Value("${app.atlas.application-source:web}") String applicationSource,
                         @Value("${app.atlas.fuzzy-max-distance:6}") int fuzzyMaxDistance) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
        this.searchPath = searchPath;
        this.locale = locale;
        this.projectIdentifier = projectIdentifier;
        this.applicationSource = applicationSource;
        this.fuzzyMaxDistance = fuzzyMaxDistance;
        this.stations = loadStations();
        this.byNormalizedName = index(stations);
        log.info("AtlasProvider loaded {} stations from {} (fuzzy max distance {})",
                stations.size(), STATIONS_RESOURCE, fuzzyMaxDistance);
    }

    @Override
    public Source source() {
        return Source.ATLAS;
    }

    @Override
    public boolean supports(DomainType domain) {
        return domain == DomainType.BUS;
    }

    @Override
    public List<Offer> search(SearchIntent intent) {
        if (intent == null || intent.getRoute() == null) {
            return List.of();
        }

        String fromQuery = stationQuery(intent.getRoute().getFrom());
        String toQuery = stationQuery(intent.getRoute().getTo());
        LocalDate date = intent.getDates() != null && intent.getDates().getFrom() != null
                ? intent.getDates().getFrom()
                : LocalDate.now();
        int passengers = passengerCount(intent);

        Station from = findStation(fromQuery)
                .orElseThrow(() -> new IllegalArgumentException(notFoundMessage("отправления", fromQuery)));
        Station to = findStation(toQuery)
                .orElseThrow(() -> new IllegalArgumentException(notFoundMessage("прибытия", toQuery)));

        log.debug("Atlas search {} ({}) -> {} ({}) on {} for {} pax",
                from.name(), from.id(), to.name(), to.id(), date, passengers);

        String uri = UriComponentsBuilder.fromPath(searchPath)
                .queryParam("from_id", from.id())
                .queryParam("to_id", to.id())
                .queryParam("date", date.format(DATE_FMT))
                .queryParam("passengers", passengers)
                .build()
                .encode()
                .toUriString();

        ResponseEntity<String> response = restClient.get()
                .uri(uri)
                .header(HttpHeaders.ACCEPT, "application/json")
                .header(HttpHeaders.ACCEPT_LANGUAGE, locale)
                .header(HttpHeaders.USER_AGENT, USER_AGENT)
                .header("x-project-identifier", projectIdentifier)
                .header("x-application-source", applicationSource)
                .retrieve()
                .toEntity(String.class);

        return mapOffers(response.getBody(),
                response.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE),
                from, to, date);
    }

    private List<Offer> mapOffers(String body, String contentType, Station from, Station to, LocalDate date) {
        List<Offer> offers = new ArrayList<>();
        int index = 0;
        for (JsonNode root : parsePayload(body, contentType)) {
            for (JsonNode ride : rideNodes(root)) {
                offers.add(toTransportOffer(ride, from, to, date, index++));
            }
        }
        log.debug("Atlas returned {} offers for {} -> {}", offers.size(), from.name(), to.name());
        return offers;
    }

    private TransportOffer toTransportOffer(JsonNode ride, Station from, Station to, LocalDate date, int index) {
        String id = firstText(ride, "id", "rideId", "tripId", "uuid");
        if (id == null) {
            id = "atlas-" + from.id() + "-" + to.id() + "-" + date + "-" + index;
        }
        String title = firstText(ride, "carrier", "name", "carrierName", "carrier_name", "title");
        if (title == null) {
            title = "AtlasBus";
        }

        ZoneId zone = rideZone(ride);
        Instant departure = parseInstant(ride, date, zone, "departure", "departureTime", "departure_at", "departureDate", "fromTime");
        Instant arrival = parseInstant(ride, date, zone, "arrival", "arrivalTime", "arrival_at", "arrivalDate", "toTime");
        Price price = parsePrice(ride);
        boolean direct = ride.hasNonNull("direct")
                ? ride.get("direct").asBoolean()
                : transfers(ride) == 0;
        String url = firstText(ride, "url", "deepLink", "link", "bookingUrl");

        Location fromLocation = rideLocation(ride, "from", from);
        Location toLocation = rideLocation(ride, "to", to);

        return new TransportOffer(id, DomainType.BUS, Source.ATLAS, title,
                fromLocation, toLocation, departure, arrival, price, direct, url);
    }

    private static ZoneId rideZone(JsonNode ride) {
        for (String point : new String[]{"from", "to"}) {
            JsonNode node = ride.get(point);
            if (node != null && node.hasNonNull("timezone")) {
                try {
                    return ZoneId.of(node.get("timezone").asText());
                } catch (Exception ignored) {
                }
            }
        }
        JsonNode tz = ride.get("timezone");
        if (tz != null && tz.isTextual()) {
            try {
                return ZoneId.of(tz.asText());
            } catch (Exception ignored) {
            }
        }
        return ZONE;
    }

    private static Location rideLocation(JsonNode ride, String field, Station station) {
        String name = station.name();
        JsonNode node = ride.get(field);
        if (node != null && node.hasNonNull("desc")) {
            String desc = node.get("desc").asText();
            if (!desc.isBlank()) {
                name = desc;
            }
        }
        return new Location(station.id(), name, new GeoPoint(station.latitude(), station.longitude()));
    }

    private static int transfers(JsonNode ride) {
        for (String field : new String[]{"transfers", "changes"}) {
            JsonNode node = ride.get(field);
            if (node == null || node.isNull()) {
                continue;
            }
            if (node.isNumber()) {
                return node.asInt();
            }
            if (node.isArray()) {
                return node.size();
            }
            if (node.isTextual()) {
                try {
                    return Integer.parseInt(node.asText().trim());
                } catch (NumberFormatException ignored) {
                    return 0;
                }
            }
        }
        return 0;
    }

    private Price parsePrice(JsonNode ride) {
        BigDecimal amount = firstDecimal(ride, "price", "priceByn", "priceBYN", "amount", "total", "priceAmount");
        if (amount == null) {
            JsonNode priceNode = ride.get("price");
            if (priceNode != null && priceNode.isObject()) {
                amount = firstDecimal(priceNode, "amount", "value", "total");
            }
        }
        if (amount == null) {
            JsonNode miles = ride.path("atlasMeta").path("miles").path("item").get("price");
            if (miles != null && miles.isNumber()) {
                amount = miles.decimalValue().movePointLeft(2);
            }
        }
        if (amount == null) {
            return null;
        }
        return new Price(amount, mapCurrency(firstText(ride, "currency")));
    }

    private static Currency mapCurrency(String raw) {
        if (raw == null || raw.isBlank()) {
            return Currency.BYN;
        }
        try {
            return Currency.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return Currency.BYN;
        }
    }

    private List<JsonNode> parsePayload(String body, String contentType) {
        if (body == null || body.isBlank()) {
            return List.of();
        }
        boolean sse = (contentType != null && contentType.toLowerCase(Locale.ROOT).contains("event-stream"))
                || (body.contains("data:") && body.contains("event:"));
        List<JsonNode> roots = new ArrayList<>();
        if (sse) {
            for (String line : body.split("\\r?\\n")) {
                String trimmed = line.trim();
                if (!trimmed.startsWith("data:")) {
                    continue;
                }
                String data = trimmed.substring("data:".length()).trim();
                if (data.isEmpty() || (data.charAt(0) != '{' && data.charAt(0) != '[')) {
                    continue;
                }
                JsonNode node = tryReadTree(data);
                if (node != null) {
                    roots.add(node);
                }
            }
        } else {
            JsonNode node = tryReadTree(body);
            if (node != null) {
                roots.add(node);
            }
        }
        return roots;
    }

    private List<JsonNode> rideNodes(JsonNode root) {
        if (root == null || root.isNull()) {
            return List.of();
        }
        if (root.isArray()) {
            return toList(root);
        }
        for (String field : new String[]{"rides", "trips", "offers", "results", "items"}) {
            JsonNode node = root.get(field);
            if (node != null && node.isArray()) {
                return toList(node);
            }
        }
        JsonNode data = root.get("data");
        if (data != null && !data.isNull()) {
            List<JsonNode> nested = rideNodes(data);
            if (!nested.isEmpty()) {
                return nested;
            }
        }
        return List.of();
    }

    private static List<JsonNode> toList(JsonNode array) {
        List<JsonNode> nodes = new ArrayList<>(array.size());
        array.forEach(nodes::add);
        return nodes;
    }

    private JsonNode tryReadTree(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.debug("Skipping malformed Atlas payload: {}", e.getMessage());
            return null;
        }
    }

    private Optional<Station> findStation(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }
        String norm = normalize(query);
        Optional<Station> resolved = resolve(norm);
        if (resolved.isEmpty()) {
            String transliterated = normalize(transliterateToCyrillic(query));
            if (!transliterated.isEmpty() && !transliterated.equals(norm)) {
                resolved = resolve(transliterated);
            }
        }
        resolved.ifPresent(station -> log.info("Atlas station '{}' распознана как '{}' ({}, {})",
                query, station.name(), station.id(), station.description()));
        return resolved;
    }

    private Optional<Station> resolve(String norm) {
        if (norm.isEmpty()) {
            return Optional.empty();
        }

        List<Station> exact = byNormalizedName.get(norm);
        if (exact != null && !exact.isEmpty()) {
            return pickBest(exact);
        }

        List<Station> prefix = new ArrayList<>();
        for (Map.Entry<String, List<Station>> entry
                : byNormalizedName.subMap(norm, true, norm + '\uffff', true).entrySet()) {
            if (entry.getKey().startsWith(norm)) {
                prefix.addAll(entry.getValue());
            }
        }
        if (!prefix.isEmpty()) {
            return pickBest(prefix);
        }

        List<Station> contains = new ArrayList<>();
        for (Map.Entry<String, List<Station>> entry : byNormalizedName.entrySet()) {
            if (entry.getKey().contains(norm)) {
                contains.addAll(entry.getValue());
            }
        }
        if (!contains.isEmpty()) {
            return pickBest(contains);
        }

        return fuzzyFind(norm);
    }

    private Optional<Station> fuzzyFind(String norm) {
        int maxDistance = Math.min(fuzzyMaxDistance, Math.max(1, (norm.length() + 1) / 2));
        Station best = null;
        int bestDistance = Integer.MAX_VALUE;
        for (Map.Entry<String, List<Station>> entry : byNormalizedName.entrySet()) {
            String candidate = entry.getKey();
            if (Math.abs(candidate.length() - norm.length()) > maxDistance) {
                continue;
            }
            int distance = levenshtein(candidate, norm, maxDistance);
            if (distance <= maxDistance && distance < bestDistance) {
                bestDistance = distance;
                best = pickBest(entry.getValue()).orElse(null);
            }
        }
        return Optional.ofNullable(best);
    }

    private List<Station> suggest(String query) {
        String norm = normalize(query);
        if (norm.isEmpty()) {
            norm = normalize(transliterateToCyrillic(query));
        }
        if (norm.isEmpty()) {
            return List.of();
        }
        int maxDistance = Math.max(fuzzyMaxDistance, 3);
        List<Map.Entry<Station, Integer>> scored = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (Map.Entry<String, List<Station>> entry : byNormalizedName.entrySet()) {
            String candidate = entry.getKey();
            if (Math.abs(candidate.length() - norm.length()) > maxDistance) {
                continue;
            }
            int distance = levenshtein(candidate, norm, maxDistance);
            if (distance > maxDistance) {
                continue;
            }
            Station station = pickBest(entry.getValue()).orElse(null);
            if (station != null && seen.add(station.id())) {
                scored.add(Map.entry(station, distance));
            }
        }
        return scored.stream()
                .sorted(Comparator.comparingInt((Map.Entry<Station, Integer> e) -> e.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private String notFoundMessage(String role, String query) {
        List<Station> suggestions = suggest(query);
        if (suggestions.isEmpty()) {
            return "Станция " + role + " не найдена: " + query;
        }
        String names = suggestions.stream()
                .map(Station::name)
                .distinct()
                .collect(Collectors.joining(", "));
        return "Станция " + role + " не найдена: " + query + ". Возможно, вы имели в виду: " + names;
    }

    private static String transliterateToCyrillic(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        String lower = value.toLowerCase(Locale.ROOT);
        StringBuilder out = new StringBuilder(lower.length());
        int i = 0;
        while (i < lower.length()) {
            String triple = i + 3 <= lower.length() ? lower.substring(i, i + 3) : null;
            String dual = i + 2 <= lower.length() ? lower.substring(i, i + 2) : null;
            char single = lower.charAt(i);
            if (triple != null && TRANSLIT_THREE.containsKey(triple)) {
                out.append(TRANSLIT_THREE.get(triple));
                i += 3;
            } else if (dual != null && TRANSLIT_TWO.containsKey(dual)) {
                out.append(TRANSLIT_TWO.get(dual));
                i += 2;
            } else if (TRANSLIT_ONE.containsKey(single)) {
                out.append(TRANSLIT_ONE.get(single));
                i += 1;
            } else {
                out.append(single);
                i += 1;
            }
        }
        return out.toString();
    }

    private static Optional<Station> pickBest(List<Station> candidates) {
        return candidates.stream().min(Comparator
                .comparingInt((Station s) -> "BY".equalsIgnoreCase(s.country()) ? 0 : 1)
                .thenComparingInt(s -> s.name() == null ? Integer.MAX_VALUE : s.name().length())
                .thenComparing(s -> s.name() == null ? "" : s.name()));
    }

    private List<Station> loadStations() {
        try (InputStream is = new ClassPathResource(STATIONS_RESOURCE).getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            List<Station> result = new ArrayList<>();
            for (JsonNode node : root) {
                result.add(new Station(
                        node.path("id").asText(),
                        node.path("name").asText(),
                        node.path("description").asText(null),
                        node.path("country").asText(null),
                        node.path("latitude").asDouble(),
                        node.path("longitude").asDouble()));
            }
            return List.copyOf(result);
        } catch (Exception e) {
            throw new IllegalStateException("Не удалось загрузить " + STATIONS_RESOURCE, e);
        }
    }

    private static TreeMap<String, List<Station>> index(List<Station> stations) {
        TreeMap<String, List<Station>> index = new TreeMap<>();
        for (Station station : stations) {
            index.computeIfAbsent(normalize(station.name()), key -> new ArrayList<>()).add(station);
        }
        return index;
    }

    private static String stationQuery(Location location) {
        if (location == null) {
            return null;
        }
        if (location.getName() != null && !location.getName().isBlank()) {
            return location.getName();
        }
        return location.getId();
    }

    private static int passengerCount(SearchIntent intent) {
        if (intent.getPassenger() == null) {
            return 1;
        }
        int total = intent.getPassenger().getAdults() + intent.getPassenger().getChildren();
        return Math.max(1, total);
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replace('ё', 'е')
                .replaceAll("[^\\p{L}\\p{N}]", "")
                .trim();
    }

    private static int levenshtein(String a, String b, int maxDistance) {
        int n = a.length();
        int m = b.length();
        if (Math.abs(n - m) > maxDistance) {
            return maxDistance + 1;
        }
        int[] previous = new int[m + 1];
        int[] current = new int[m + 1];
        for (int j = 0; j <= m; j++) {
            previous[j] = j;
        }
        for (int i = 1; i <= n; i++) {
            current[0] = i;
            int rowMin = current[0];
            for (int j = 1; j <= m; j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                current[j] = Math.min(Math.min(previous[j] + 1, current[j - 1] + 1), previous[j - 1] + cost);
                if (current[j] < rowMin) {
                    rowMin = current[j];
                }
            }
            if (rowMin > maxDistance) {
                return maxDistance + 1;
            }
            int[] swap = previous;
            previous = current;
            current = swap;
        }
        return previous[m];
    }

    private static Instant parseInstant(JsonNode node, LocalDate date, ZoneId zone, String... fields) {
        for (String field : fields) {
            JsonNode value = node.get(field);
            if (value == null || value.isNull()) {
                continue;
            }
            if (value.isNumber()) {
                long raw = value.asLong();
                return raw > 100_000_000_000L ? Instant.ofEpochMilli(raw) : Instant.ofEpochSecond(raw);
            }
            String text = value.asText("").trim();
            if (text.isEmpty()) {
                continue;
            }
            Instant parsed = parseInstantText(text, date, zone);
            if (parsed != null) {
                return parsed;
            }
        }
        return null;
    }

    private static Instant parseInstantText(String text, LocalDate date, ZoneId zone) {
        if (text.matches("\\d{10,13}")) {
            long raw = Long.parseLong(text);
            return raw > 100_000_000_000L ? Instant.ofEpochMilli(raw) : Instant.ofEpochSecond(raw);
        }
        try {
            return Instant.parse(text);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return OffsetDateTime.parse(text).toInstant();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(text).atZone(zone).toInstant();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalTime.parse(text).atDate(date).atZone(zone).toInstant();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return date.atStartOfDay(zone).toInstant();
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            JsonNode value = node.get(field);
            if (value != null && value.isValueNode() && !value.isNull() && !value.asText().isBlank()) {
                return value.asText();
            }
        }
        return null;
    }

    private static BigDecimal firstDecimal(JsonNode node, String... fields) {
        for (String field : fields) {
            JsonNode value = node.get(field);
            if (value == null || value.isNull()) {
                continue;
            }
            if (value.isNumber()) {
                return value.decimalValue();
            }
            if (value.isTextual()) {
                BigDecimal parsed = toDecimal(value.asText());
                if (parsed != null) {
                    return parsed;
                }
            }
        }
        return null;
    }

    private static BigDecimal toDecimal(String text) {
        try {
            return new BigDecimal(text.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private record Station(String id, String name, String description, String country,
                           double latitude, double longitude) {
    }
}
