package com.example.cafe.domain.trade.controller.user;

import com.example.cafe.domain.member.service.AuthTokenService;
import com.example.cafe.domain.trade.domain.dto.request.ItemCartRequestDto;
import com.example.cafe.domain.trade.domain.dto.response.CartListResponseDto;
import com.example.cafe.domain.trade.domain.dto.response.ItemCartResponseDto;
import com.example.cafe.domain.trade.service.user.UserCartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
@Tag(name = "User Cart API", description = "사용자가 카트 보기, 카드에 상품 추가하기, 카트에 있는 상품 수정하기 기능을 제공합니다.")
public class UserCartController {
    private final AuthTokenService authTokenService;
    private final UserCartService service;

    @Operation(summary = "카트(장바구니) 보기", description = "회원 카트에 있는 상품 목록을 제공합니다.")
    @GetMapping
    public ResponseEntity<CartListResponseDto> showCart(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        return ResponseEntity.ok(service.showCart(authTokenService.getIdFromToken(authHeader)));
    }

    @Operation(summary = "카트에 상품 추가", description = "회원 카트에 상품을 추가하는 기능을 제공합니다.")
    @PostMapping("/add")
    public ResponseEntity<ItemCartResponseDto> addCart(
            @RequestBody ItemCartRequestDto addItem,
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        return ResponseEntity.ok(service.addItemToCart(authTokenService.getIdFromToken(authHeader), addItem));
    }

    @Operation(summary = "카트에 있는 상품 수량 수정", description = "회원 카트에 있는 상품의 수량을 수정할 수 있습니다. 수량이 0 이면 삭제.")
    @PostMapping("/edit")
    public ResponseEntity<ItemCartResponseDto> editCart(
            @RequestBody ItemCartRequestDto editItem,
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        return ResponseEntity.ok(service.editItemToCart(authTokenService.getIdFromToken(authHeader), editItem));
    }


}
