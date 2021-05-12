package com.egemmerce.hc.item.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.egemmerce.hc.auction.service.AuctionParticipantService;
import com.egemmerce.hc.item.service.ItemSellService;
import com.egemmerce.hc.item.service.ItemService;
import com.egemmerce.hc.repository.dto.AuctionParticipant;
import com.egemmerce.hc.repository.dto.Item;
import com.egemmerce.hc.repository.dto.ItemSell;
import com.egemmerce.hc.repository.dto.User;
import com.egemmerce.hc.repository.dto.UserAddress;
import com.egemmerce.hc.user.address.service.UserAddressService;
import com.egemmerce.hc.user.service.UserCreditService;
import com.egemmerce.hc.user.service.UserService;

import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("/itemSell")
public class ItemSellController {

	@Autowired
	private ItemSellService itemSellService;
	@Autowired
	private ItemService itemService;
	@Autowired
	private AuctionParticipantService auctionParticipantService;
	@Autowired
	private UserService userService;
	@Autowired
	private UserAddressService userAddressService;
	@Autowired
	private UserCreditService userCreditService;

	/* C :: 상품 등록 */
	@ApiOperation(value = "is_user_no,is_auction_price, is_category_main, is_cool_price, is_name, is_orgin_price, is_start_date, is_end_date")
	@PostMapping("/regist")
	public ResponseEntity<String> createItem(@RequestBody ItemSell itemSell) throws Exception {
		Item item = itemService.insert(Item.builder().iType("Sell").build());
		itemSell.setIsItemNo(item.getiNo());
		if (itemSellService.insertItemSell(itemSell) != null)
			return new ResponseEntity<String>("상품 등록 성공", HttpStatus.OK);
		return new ResponseEntity<String>("상품 등록 실패", HttpStatus.NO_CONTENT);
	}

	/* R :: 상품 전체조회 */
	@GetMapping("/all")
	public ResponseEntity<Page<ItemSell>> selectItemAll(Pageable pageable) throws Exception {
		Page<ItemSell> itemSell=itemSellService.selectItemSellAll(pageable);
		System.out.println(itemSell.getSize());
		return new ResponseEntity<Page<ItemSell>>(itemSell, HttpStatus.OK);
	}

	/* R :: 상품명 조회 */
	@GetMapping("/name")
	public ResponseEntity<Page<ItemSell>> selectItemByiName(String isName, Pageable pageable) throws Exception {
		return new ResponseEntity<Page<ItemSell>>(itemSellService.selectItemSellByisName(isName, pageable),
				HttpStatus.OK);
	}

	/* U :: 상품 업데이트(쿨거래) */
	@ApiOperation(value = "거래완료 변경(쿨거래)")
	@PutMapping("/updateDealCompleted")
	public ResponseEntity<String> updateItembyCool(int isItemNo,int uNo,int uaNo) throws Exception {
		if (itemService.updateItemDealCompleted(isItemNo) != null) {
			itemSellService.updateItembyCool(isItemNo,uNo,uaNo);
			return new ResponseEntity<String>("거래완료 처리 성공", HttpStatus.OK);

		}
		return new ResponseEntity<String>("거래완료 처리 실패", HttpStatus.NO_CONTENT);
	}
	/* U :: 상품 업데이트(경매 종료) */
	@ApiOperation(value = "거래완료 변경(경매 기간 종료)")
	@PutMapping("/endAuction")
	public ResponseEntity<String> endAuction() throws Exception {
		
		List<ItemSell> endItemSell=itemSellService.selectOverEndDate();
		if(endItemSell.size()==0) {
			return new ResponseEntity<String>("종료된 경매가 없습니다.",HttpStatus.ACCEPTED);
		}else {
			for (ItemSell is : endItemSell) {
				itemService.updateItemDealCompleted(is.getIsItemNo());
				itemSellService.updateItembyAuction(is);
				
			}
			return new ResponseEntity<String>("종료된 경매 변경 완료", HttpStatus.ACCEPTED);
		}
	}

	/* U :: 상품 업데이트 */
	@PutMapping("/update")
	public ResponseEntity<String> updateItemSell(@RequestBody ItemSell itemSell) throws Exception {
		if (itemSellService.updateItemSell(itemSell) != null)
			return new ResponseEntity<String>("Success", HttpStatus.OK);
		return new ResponseEntity<String>("Fail", HttpStatus.NO_CONTENT);
	}

	/* D :: 상품 삭제 */
	@DeleteMapping("/delete")
	public ResponseEntity<String> deleteItem(int isItemNo) throws Exception {
		if (itemSellService.deleteItemSell(isItemNo))
			return new ResponseEntity<String>("상품 삭제 성공", HttpStatus.OK);
		return new ResponseEntity<String>("상품 삭제 실패", HttpStatus.NO_CONTENT);
	}

	/* 경매 입찰 */
	@PutMapping("/auction")
	public ResponseEntity<String> updateAuction(int isUserNo, int isItemNo, int isAuctionPrice) throws Exception {
		// 입찰에 참여한 물건 정도
		ItemSell itemSell = itemSellService.selectItemSellbyisItemNo(isItemNo);

		// 현 입찰가보다 작을 경유
		if (itemSell.getIsAuctionPrice() > isAuctionPrice) {
			return new ResponseEntity<String>("기존 경매가보다 작습니다.", HttpStatus.OK);
		}
		// 아이템 정보 변경
		if (itemSellService.updateAuctionPrice(isItemNo,isAuctionPrice) != null) {
			User user = userService.selectUserByuNo(isUserNo);

			// 유저 배송지 가져오기
			UserAddress userAddress = userAddressService.selectDefaultAddress(user.getuNo());

			// 이전에 경매에 참여한 사람 크래딧 환불
			AuctionParticipant beforeAP = auctionParticipantService.selectBeforeAP(isItemNo);
			userService.updateUserCreditbyFail(beforeAP.getApUserNo(), beforeAP.getApBid(), isItemNo);

			// 새로 입찰한 사람
			AuctionParticipant auctionParticipant = AuctionParticipant.builder().apItemNo(isItemNo).apUserNo(isUserNo)
					.apBid(isAuctionPrice).apAddress(userAddress.getUaNo()).build();
			auctionParticipant.generateapDate();
			auctionParticipantService.insert(auctionParticipant);

			// 새로 입찰한 유저 포인트 출금
			userService.updateUserCreditbyAP(user, isAuctionPrice, isItemNo);

			return new ResponseEntity<String>("경매가 업데이트 성공.", HttpStatus.OK);
		}
		return new ResponseEntity<String>("경매가 업데이트 실패.", HttpStatus.OK);
	}
}
