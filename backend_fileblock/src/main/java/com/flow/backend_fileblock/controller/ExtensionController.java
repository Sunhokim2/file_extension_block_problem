package com.flow.backend_fileblock.controller;

import com.flow.backend_fileblock.dto.CustomExtensionDto;
import com.flow.backend_fileblock.model.Extension;
import com.flow.backend_fileblock.service.ExtensionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class ExtensionController {

    private final ExtensionService extensionService;
    private static final String VISITOR_ID_HEADER = "X-Visitor-ID";


    @GetMapping("/extensions")
    public ResponseEntity<Map<String, Object>> getInitialData() {
        Map<String, Object> data = new HashMap<>();
        data.put("fixedExtensions", extensionService.getFixedExtensions());
        data.put("customExtensions", extensionService.getCustomExtensions());
        data.put("currentCustomCount", extensionService.getCustomExtensionCount());

        return ResponseEntity.ok(data);
    }


    @PostMapping("/fixed/update")
    public ResponseEntity<?> updateFixedExtension(
            @RequestParam String name, @RequestParam boolean checked,
            @RequestHeader(VISITOR_ID_HEADER) String visitorId) {
        try {
            extensionService.updateFixedExtension(name, checked, visitorId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("업데이트 실패: " + e.getMessage());
        }
    }


    @PostMapping("/custom/add")
    public ResponseEntity<?> addCustomExtension(
            @Valid @ModelAttribute CustomExtensionDto dto,
            BindingResult bindingResult,
            @RequestHeader(VISITOR_ID_HEADER) String visitorId) {

        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getAllErrors().stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMsg);
        }

        try {
            Extension newExtension = extensionService.addCustomExtension(dto.getName(),visitorId);
            return ResponseEntity.status(HttpStatus.CREATED).body(newExtension);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("알 수 없는 오류가 발생했습니다.");
        }
    }


    @PostMapping("/custom/delete")
    public ResponseEntity<Void> deleteCustomExtension(
            @RequestParam Long id
            ) {
        try {
            extensionService.deleteCustomExtension(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 실제 테스트용 파일 업로드 api
    // 원래는 DB에 저장해야하지만 파일확장자 차단을 테스트하는용도라서 결과값만 리턴되게 하였습니다.
    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("fileUpload") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("업로드할 파일을 선택해주세요.");
        }
        try {
            String extension = extensionService.getExtensionFromFilename(file.getOriginalFilename());

            if (extensionService.isExtensionBlocked(extension)) {
                log.warn("차단된 파일 업로드 시도: {}, 확장자: {}", file.getOriginalFilename(), extension);
                return ResponseEntity.badRequest().body("차단된 파일 확장자입니다: ." + extension);
            } else {
                log.info("파일 업로드 성공 (시뮬레이션): {}", file.getOriginalFilename());
                return ResponseEntity.ok("파일 업로드 성공 (시뮬레이션): " + file.getOriginalFilename());
            }
        } catch (Exception e) {
            log.error("업로드 중 오류 발생", e);
            return ResponseEntity.internalServerError().body("업로드 중 서버 오류가 발생했습니다.");
        }
    }
}