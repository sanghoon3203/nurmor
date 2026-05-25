package com.atlas.api.codex;

import java.util.Locale;

public final class SpeciesClassifier {

    private SpeciesClassifier() {
    }

    public static DisplayGroup displayGroup(String displayName, String scientificName, CodexCategory category) {
        String source = source(displayName, scientificName);
        if (containsAny(source, "나비", "곤충", "벌", "개미", "잠자리", "무당벌레", "장수풍뎅이", "insect", "butterfly", "beetle", "ladybug")) {
            return DisplayGroup.INSECT;
        }
        if (containsAny(source, "새", "참새", "직박구리", "조류", "bird", "sparrow")) {
            return DisplayGroup.BIRD;
        }
        if (containsAny(source, "물고기", "어류", "붕어", "fish")) {
            return DisplayGroup.FISH;
        }
        if (containsAny(source, "개구리", "도롱뇽", "양서류", "frog", "amphibian")) {
            return DisplayGroup.AMPHIBIAN;
        }
        if (containsAny(source, "뱀", "도마뱀", "파충류", "reptile")) {
            return DisplayGroup.REPTILE;
        }
        if (containsAny(source, "수달", "다람쥐", "포유류", "mammal", "otter", "squirrel")) {
            return DisplayGroup.MAMMAL;
        }
        if (containsAny(source, "버섯", "균류", "fungi", "mushroom")) {
            return DisplayGroup.FUNGI;
        }
        if (category == CodexCategory.PLANT || containsAny(source, "꽃", "초", "풀", "나무", "잎", "식물", "민들레", "고사리", "이끼", "plant", "flower")) {
            return DisplayGroup.PLANT;
        }
        if (category == CodexCategory.ANIMAL) {
            return DisplayGroup.ANIMAL;
        }
        return DisplayGroup.OTHER;
    }

    public static String speciesKey(String displayName, String scientificName) {
        String value = scientificName == null || scientificName.isBlank() ? displayName : scientificName;
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9가-힣]+", "-");
    }

    public static String speciesDescription(String displayName, DisplayGroup displayGroup) {
        return switch (displayGroup) {
            case PLANT -> "%s은 이 지역의 빛과 토양 조건에 적응해 관찰되는 식물입니다.".formatted(displayName);
            case BIRD -> "%s은 주변 숲길과 수변 공간을 오가며 관찰되는 조류입니다.".formatted(displayName);
            case FISH -> "%s은 물길과 호수 주변 기록에서 자주 확인되는 어류입니다.".formatted(displayName);
            case INSECT -> "%s은 계절 변화와 식생 상태를 보여주는 곤충 기록입니다.".formatted(displayName);
            case AMPHIBIAN -> "%s은 습한 서식 환경을 알려주는 양서류 기록입니다.".formatted(displayName);
            case REPTILE -> "%s은 햇빛이 드는 녹지 가장자리에서 확인될 수 있는 파충류입니다.".formatted(displayName);
            case MAMMAL -> "%s은 도시 녹지와 물가를 함께 이용하는 포유류 기록입니다.".formatted(displayName);
            case FUNGI -> "%s은 낙엽층과 습도 변화가 남긴 균류 기록입니다.".formatted(displayName);
            case ANIMAL -> "%s은 이 지역 생태 흐름을 보여주는 동물 기록입니다.".formatted(displayName);
            case OTHER -> "%s은 추가 확인이 필요한 생태 기록입니다.".formatted(displayName);
        };
    }

    private static String source(String displayName, String scientificName) {
        return ((displayName == null ? "" : displayName) + " " + (scientificName == null ? "" : scientificName))
            .toLowerCase(Locale.ROOT);
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
