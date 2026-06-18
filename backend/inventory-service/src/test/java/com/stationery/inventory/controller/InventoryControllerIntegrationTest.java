package com.stationery.inventory.controller;

import com.stationery.inventory.dto.StationeryItemRequest;
import com.stationery.inventory.dto.StationeryItemResponse;
import com.stationery.inventory.model.StationeryItem;
import com.stationery.inventory.repository.StationeryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class InventoryControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private StationeryItemRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void testCreateAndGetItem() {
        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Role", "ADMIN");
        headers.set("X-User-Name", "admin1");

        // Create an item
        StationeryItemRequest request = new StationeryItemRequest();
        request.setName("Integration Marker");
        request.setCategory("WRITING");
        request.setUnit("pcs");
        request.setAvailableQuantity(50);
        request.setMinimumQuantity(10);
        request.setDescription("Integration testing marker");

        HttpEntity<StationeryItemRequest> requestEntity = new HttpEntity<>(request, headers);

        ResponseEntity<StationeryItemResponse> createResponse = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/inventory", requestEntity, StationeryItemResponse.class);

        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        assertNotNull(createResponse.getBody());
        assertNotNull(createResponse.getBody().getId());
        assertEquals("Integration Marker", createResponse.getBody().getName());

        // Get the items
        ResponseEntity<String> getResponse = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/inventory", String.class);

        assertEquals(HttpStatus.OK, getResponse.getStatusCode());
        assertNotNull(getResponse.getBody());
    }
}
