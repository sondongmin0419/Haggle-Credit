package com.egemmerce.hc.repository.mapper;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.egemmerce.hc.repository.dto.ItemSell;

@Transactional
public interface ItemSellRepository extends JpaRepository<ItemSell, Long> {

	Page<ItemSell> findByisItemNameContaining(String isItemName, Pageable pageable);
	Page<ItemSell> findAll(Pageable pageable);

	ItemSell findByisItemNo(int isItemNo);

	List<ItemSell> findByisDealUserNo(int isDealUserNo);
	List<ItemSell> findByisUserNo(int uNo);

}
