package com.atlas.api.codex;

import java.util.Locale;

public enum CodexCategory {
    PLANT,
    ANIMAL,
    OTHER;

    public static CodexCategory infer(String displayName, String scientificName) {
        String source = ((displayName == null ? "" : displayName) + " " + (scientificName == null ? "" : scientificName))
            .toLowerCase(Locale.ROOT);
        if (containsAny(source, "나비", "새", "조류", "곤충", "벌", "개미", "잠자리", "개구리", "물고기", "어류", "포유류", "동물")) {
            return ANIMAL;
        }
        if (containsAny(source, "꽃", "초", "풀", "나무", "잎", "식물", "민들레", "고사리", "이끼", "버섯")) {
            return PLANT;
        }
        return OTHER;
    }

    private static boolean containsAny(String source, String... fragments) {
        for (String fragment : fragments) {
            if (source.contains(fragment)) {
                return true;
            }
        }
        return false;
    }
}
