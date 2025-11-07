package com.flow.backend_fileblock.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "extensions", indexes = {
        @Index(name = "idx_blocked_status", columnList = "blocked")
})
@Getter
@NoArgsConstructor
public class Extension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //중복을 DB에서 차단
    @Column(unique = true, nullable = false, length = 20)
    private String name;

    // 확장자 타입
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ExtensionType type;

    // true: 차단, false: 허용
    @Column(nullable = false)
    private boolean checked;

    // 로그 추적용
    @Column(nullable = false)
    private LocalDateTime changedAt;
    @Column(nullable = false)
    private String changedByIP;

    @Builder
    public Extension(String name, ExtensionType type, boolean checked, LocalDateTime changedAt, String changedByIP) {
        this.name = name;
        this.type = type;
        this.checked = checked;
        this.changedAt = changedAt;
        this.changedByIP = changedByIP;
    }

    public void updateExtensionStatus(boolean newStatus, String visitorID) {
        if (this.type == ExtensionType.FIXED) {
            this.checked = newStatus;
            this.changedAt = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
            this.changedByIP = visitorID;
        }
    }
}
