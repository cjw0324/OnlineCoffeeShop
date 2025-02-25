package com.example.cafe.domain.trade.repository;

import com.example.cafe.domain.trade.domain.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TradeRepository extends JpaRepository<Trade, Long> {
    Optional<Trade> findByTradeUUID(String tradeUUID);
    @Query("SELECT COUNT(t) > 0 FROM Trade t JOIN t.tradeItems ti WHERE t.member.id = :memberId AND ti.item.id = :itemId")
    boolean existsByMemberIdAndItemId(@Param("memberId") Long memberId, @Param("itemId") Long itemId);
}
