package models;

import com.fasterxml.jackson.databind.JsonNode;
import play.libs.Json;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public enum Role {

    ADMIN("ADMIN", "Administrator"),
    CREATED("CREATED", "Recently created");

    private final String value;
    private final String label;

    Role(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public String value() {
        return this.value;
    }

    public String label() {
        return this.label;
    }

    public static JsonNode findAll() {
        Map tmp = new HashMap<Role, String>();
        for(Role type : Role.values()){
            tmp.put(type, type.label);
        }
        return Json.toJson(tmp);
    }
}