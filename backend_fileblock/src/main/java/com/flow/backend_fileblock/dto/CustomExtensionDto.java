package com.flow.backend_fileblock.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomExtensionDto {

    @NotEmpty(message = "확장자를 입력해주세요.")
    @Size(max = 20, message = "확장자는 최대 20자까지 입력 가능합니다.")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "확장자는 영문자와 숫자만 사용 가능합니다.")
    private String name;
}