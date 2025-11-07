package com.flow.backend_fileblock.service;


import com.flow.backend_fileblock.model.Extension;
import com.flow.backend_fileblock.model.ExtensionType;
import com.flow.backend_fileblock.repository.ExtensionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExtensionService {

    private final ExtensionRepository extensionRepository;

    private static final int MAX_CUSTOM_EXTENSIONS = 200;

    private static final Set<String> FIXED_EXTENSIONS = Set.of(
            "bat", "cmd", "com", "cpl", "exe", "scr", "js"
    );


    @PostConstruct
    @Transactional
    public void initFixedExtensions() {
        log.info("고정 확장자 데이터베이스 초기화 시작");
        for (String extName : FIXED_EXTENSIONS) {
            if (!extensionRepository.existsByName(extName)) {
                Extension newExt = Extension.builder()
                        .name(extName)
                        .type(ExtensionType.FIXED)
                        .checked(false)
                        .changedAt(LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES))
                        .changedByIP("NAN")
                        .build();
                extensionRepository.save(newExt);
                log.info("'{}' 고정 확장자를 DB에 추가했습니다.", extName);
            }
        }
        log.info("고정 확장자 초기화 완료.");
    }

    public List<Extension> getFixedExtensions() {
        return extensionRepository.findByType(ExtensionType.FIXED);
    }


    public List<Extension> getCustomExtensions() {
        return extensionRepository.findByType(ExtensionType.CUSTOM);
    }

    public long getCustomExtensionCount() {
        return extensionRepository.countByType(ExtensionType.CUSTOM);
    }

    //  핵심 CUD 비즈니스 로직
    @Transactional
    public void updateFixedExtension(String name, boolean isChecked, String visitorID) {
        Extension extension = extensionRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고정 확장자입니다: " + name));

        // 타입 체크 (백엔드로 바로 요청보낼시 차단용)
        if (extension.getType() != ExtensionType.FIXED) {
            throw new IllegalArgumentException("커스텀 확장자 상태는 변경할 수 없습니다.");
        }

        extension.updateExtensionStatus(isChecked, visitorID);
    }

    @Transactional
    public Extension addCustomExtension(String name, String visitorID) {
        String normalizedName = name.toLowerCase().replace(".", "");


        if (getCustomExtensionCount() >= MAX_CUSTOM_EXTENSIONS) {
            throw new IllegalStateException("커스텀 확장자는 최대 " + MAX_CUSTOM_EXTENSIONS + "개까지 등록할 수 있습니다.");
        }

        if (extensionRepository.existsByName(normalizedName)) {
            throw new IllegalStateException("이미 '고정' 또는 '커스텀'으로 등록된 확장자입니다.");
        }

        Extension newExtension = Extension.builder()
                .name(normalizedName)
                .type(ExtensionType.CUSTOM)
                .checked(true)
                .changedAt(LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES))
                .changedByIP(visitorID)
                .build();

        return extensionRepository.save(newExtension);
    }

    @Transactional
    public void deleteCustomExtension(Long id) {
        extensionRepository.deleteByIdAndType(id, ExtensionType.CUSTOM);
    }


    public List<Extension> getCheckedExtensions() {
        return extensionRepository.findByChecked(true);
    }


    public String getExtensionFromFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');

        if (lastDotIndex == -1 || lastDotIndex == 0 || lastDotIndex == filename.length() - 1) {
            return ""; // 확장자 없음
        }

        return filename.substring(lastDotIndex + 1).toLowerCase();
    }


    public boolean isExtensionBlocked(String extension) {
        if (extension == null || extension.isEmpty()) {
            return false;
        }

        return extensionRepository.existsByNameAndChecked(extension, true);
    }
}