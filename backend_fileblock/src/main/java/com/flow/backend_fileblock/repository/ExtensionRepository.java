package com.flow.backend_fileblock.repository;

import com.flow.backend_fileblock.model.Extension;
import com.flow.backend_fileblock.model.ExtensionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExtensionRepository extends JpaRepository<Extension, Long> {
    // 중복검사용
    boolean existsByName(String name);

    Optional<Extension> findByName(String name);


    // 프론트에서 쓸 용도
    List<Extension> findByType(ExtensionType type);
    // 커스텀 개수 제한용도
    long countByType(ExtensionType type);
    List<Extension> findByChecked(boolean checked);

    // 이름과 타입으로 삭제
    void deleteByNameAndType(String name, ExtensionType type);
    void deleteByIdAndType(Long id, ExtensionType extensionType);

    boolean existsByNameAndChecked(String name, boolean checked);
}
