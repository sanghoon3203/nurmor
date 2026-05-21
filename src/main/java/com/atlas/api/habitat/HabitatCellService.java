package com.atlas.api.habitat;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class HabitatCellService {

    private final HabitatCellRepository repository;

    public HabitatCellService(HabitatCellRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<HabitatCell> nearby() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public HabitatCell get(UUID id) {
        return repository.findById(id).orElseThrow();
    }
}
