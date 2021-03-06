package com.egemmerce.hc.item.controller;

import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.egemmerce.hc.alarm.service.AlarmService;
import com.egemmerce.hc.auction.service.ReverseAuctionParticipantService;
import com.egemmerce.hc.imageupload.service.ImageUploadService;
import com.egemmerce.hc.item.service.ItemBuyService;
import com.egemmerce.hc.item.service.ItemService;
import com.egemmerce.hc.repository.dto.Alarm;
import com.egemmerce.hc.repository.dto.Item;
import com.egemmerce.hc.repository.dto.ItemBuy;
import com.egemmerce.hc.repository.dto.ItemBuySet;
import com.egemmerce.hc.repository.dto.ItemCtgrCnt;
import com.egemmerce.hc.repository.dto.ItemCtgrSearch;
import com.egemmerce.hc.repository.dto.ItemPhoto;
import com.egemmerce.hc.repository.dto.ItemPhotoSet;
import com.egemmerce.hc.repository.dto.ReverseAuctionParticipant;
import com.egemmerce.hc.repository.dto.SortProcess;
import com.egemmerce.hc.repository.dto.User;
import com.egemmerce.hc.user.service.UserService;

import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("/itemBuy")
public class ItemBuyController {

	@Autowired
	private ItemBuyService itemBuyService;
	@Autowired
	private ItemService itemService;
	@Autowired
	private UserService userService;
	@Autowired
	private ReverseAuctionParticipantService reverseAuctionParticipantService;
	@Autowired
	private ImageUploadService imageUploadService;
	@Autowired
	private AlarmService alarmService;

	/* C :: ?????? ?????? */
	@ApiOperation(value = "ib_auction_price,ib_category_main,ib_cool_price,ib_deal_address,ib_name,ib_start_date,ib_user_no,ib_end_date")
	@PostMapping("/regist")
	public ResponseEntity<?> createItem(@RequestBody ItemBuy itemBuy) throws Exception {
		Item item = itemService.insert(Item.builder().iType("buy").build());
		System.out.println(item.getiNo());
		itemBuy.setIbItemNo(item.getiNo());
		ItemBuy check = itemBuyService.insertItemBuy(itemBuy);
		User user = userService.selectUserByuNo(check.getIbUserNo());
		userService.updateUserCreditbyRegistBuy(user, check.getIbAuctionInitPrice(), check.getIbItemNo());

		return new ResponseEntity<ItemBuy>(check, HttpStatus.OK);
	}

	/* R :: ?????? ???????????? */
	@GetMapping("/all")
	public ResponseEntity<Page<ItemBuy>> selectItemAll(Pageable pageable) throws Exception {
		return new ResponseEntity<Page<ItemBuy>>(itemBuyService.selectItemBuyAll(pageable), HttpStatus.OK);
	}

	/* R :: ????????? ?????? */
	@GetMapping("/name")
	public ResponseEntity<Page<ItemBuy>> selectItemByiName(String ibName, Pageable pageable) throws Exception {
		return new ResponseEntity<Page<ItemBuy>>(itemBuyService.selectItemBuyByibName(ibName, pageable), HttpStatus.OK);
	}

	/* U :: ?????? ????????????(?????????) */
	@ApiOperation(value = "???????????? ??????(?????????)")
	@PutMapping("/updateDealCompleted")
	public ResponseEntity<String> updateItem(int ibItemNo, int uNo) throws Exception {
		if (itemService.updateItemDealCompleted(ibItemNo) != null) {
			itemBuyService.updateItemByCool(ibItemNo, uNo);
			ItemBuy itemBuy = itemBuyService.selectItemBuybyibItemNo(ibItemNo);
			userService.updateUserCreditbyBuyCool(itemBuy.getIbUserNo(), itemBuy);
			return new ResponseEntity<String>("???????????? ?????? ??????", HttpStatus.OK);

		}
		return new ResponseEntity<String>("???????????? ?????? ??????", HttpStatus.NO_CONTENT);
	}

	/* U :: ?????? ????????????(?????? ??????) */
	@ApiOperation(value = "???????????? ??????(?????? ?????? ??????)")
	@PutMapping("/endAuction")
	public ResponseEntity<String> endAuction() throws Exception {

		List<ItemBuy> endItemBuy = itemBuyService.selectOverEndDate();
		if (endItemBuy.size() == 0) {
			return new ResponseEntity<String>("????????? ????????? ????????????.", HttpStatus.ACCEPTED);
		} else {
			for (ItemBuy ib : endItemBuy) {
				itemService.updateItemDealCompleted(ib.getIbItemNo());
				itemBuyService.updateItembyAuction(ib);

			}
			return new ResponseEntity<String>("????????? ?????? ?????? ??????", HttpStatus.ACCEPTED);
		}
	}

	/* U :: ?????? ???????????? */
	@PutMapping("/update")
	public ResponseEntity<String> updateItemSell(@RequestBody ItemBuy itemBuy) throws Exception {
		if (itemBuyService.updateItemBuy(itemBuy) != null)
			return new ResponseEntity<String>("Success", HttpStatus.OK);
		return new ResponseEntity<String>("Fail", HttpStatus.NO_CONTENT);
	}

	/* D :: ?????? ?????? */
	@DeleteMapping("/delete")
	public ResponseEntity<String> deleteItem(int ibItemNo) throws Exception {
		if (itemBuyService.deleteItemBuy(ibItemNo))
			return new ResponseEntity<String>("?????? ?????? ??????", HttpStatus.OK);
		return new ResponseEntity<String>("?????? ?????? ??????", HttpStatus.NO_CONTENT);
	}

	/* ?????? ?????? */
	@PutMapping("/auction")
	public ResponseEntity<String> updateReverseAuction(int ibUserNo, int ibItemNo, int ibAuctionPrice)
			throws Exception {
		ItemBuy itemBuy = itemBuyService.selectItemBuybyibItemNo(ibItemNo);
		Item item = itemService.selectItem(ibItemNo);
		if (itemBuy.getIbAuctionIngPrice() < ibAuctionPrice) {
			return new ResponseEntity<String>("?????? ??????????????? ?????????.", HttpStatus.OK);
		}
		ReverseAuctionParticipant rp = ReverseAuctionParticipant.builder().rapBid(ibAuctionPrice).rapItemNo(ibItemNo)
				.rapUserNo(ibUserNo).build();
		rp.generaterapDate();
		if (itemBuyService.updateReverseAuctionPrice(ibItemNo, ibAuctionPrice) != null) {
			List<ReverseAuctionParticipant> raplist = reverseAuctionParticipantService
					.findByrapItemNoOrderByDate(ibItemNo);
			if (raplist.size() != 0) {

				Alarm alarm = Alarm.builder().aContent("???????????? ??????????????? ??? ?????? ???????????? ???????????????. \r\n" + "????????? ??????????????? ???????????? ????????? ????????????.")
						.aType("buy").aCause("????????????").aItemNo(ibItemNo).aRecvUserNo(raplist.get(0).getRapUserNo())
						.aTitle(item.getItemBuy().getIbName())
						.aItemImageValue(item.getItemPhoto().get(0).getIpValue()).build();
				alarm.generateaTime();
				alarmService.createAlarm(alarm);
			}
			ReverseAuctionParticipant reverseAuctionParticipant = ReverseAuctionParticipant.builder()
					.rapItemNo(ibItemNo).rapBid(ibAuctionPrice).rapUserNo(ibUserNo).build();
			reverseAuctionParticipant.generaterapDate();
			reverseAuctionParticipantService.insert(reverseAuctionParticipant);

			return new ResponseEntity<String>("???????????? ???????????? ??????.", HttpStatus.OK);
		}
		return new ResponseEntity<String>("???????????? ???????????? ??????.", HttpStatus.OK);
	}

	/* R :: ?????? ?????? ?????? */
	@ApiOperation(value = "?????? ?????? ?????? Restful API")
	@GetMapping("/myitem")
	public ResponseEntity<?> selectMyItem(int uNo) throws Exception {
		List<ItemBuy> items = itemBuyService.selectMyItemByuNoOnlyBuy(uNo);
		List<ItemPhotoSet> itemsphoto = new ArrayList<>();
		for (ItemBuy ib : items) {

			itemsphoto
					.add(new ItemPhotoSet(ib, imageUploadService.selectItemPhotoList(ib.getIbItemNo()), items.size()));
		}
		if (items != null) {
			return new ResponseEntity<List<ItemPhotoSet>>(itemsphoto, HttpStatus.OK);
		}
		return new ResponseEntity<String>("?????? ?????? ????????? ??????", HttpStatus.NO_CONTENT);
	}

	@ApiOperation(value = "?????? ??? ??????")
	@GetMapping("/count")
	public ResponseEntity<Integer> countItemBuy() {
		return new ResponseEntity<Integer>(itemBuyService.countItemBuy(), HttpStatus.OK);
	}

	/////////////////////////
	/* R :: ?????????.. ?????? ?????? ?????? */
	@ApiOperation(value = "?????? : ??????????????????")
	@GetMapping("views")
	public ResponseEntity<List<ItemBuySet>> selectItemCtgr(@RequestParam(defaultValue = "1") int pageNo,
			String ctgrMain, String ctgrSub, @RequestParam(defaultValue = "ib_item_no") String sortName,
			@RequestParam(defaultValue = "down") String UD) throws Exception {
		List<ItemBuySet> ItemBuySet = null;
		SortProcess sp = new SortProcess((int) (pageNo - 1) * 100, ctgrMain, ctgrSub, sortName);

		if (UD.equals("up")) { // ????????????
			if (sp.getCtgrSub() == null) {
				sp.setCtgrSub("");
				SortProcess sortProcess = new SortProcess(sp.getPageNo(), sp.getCtgrMain(), sp.getCtgrSub(),
						sp.getSortName());
				ItemBuySet = itemBuyService.BselectItemNoSub(sortProcess);
				System.out.println("????????????????????????????????????");
			} else {
				SortProcess sortProcess = new SortProcess(sp.getPageNo(), sp.getCtgrMain(), sp.getCtgrSub(),
						sp.getSortName());
				ItemBuySet = itemBuyService.BselectItemYesSub(sortProcess);
				System.out.println("???????????? ?????????????????????");
			}
		} else { // ????????????
			if (sp.getCtgrSub() == null) {
				sp.setCtgrSub("");
				SortProcess sortProcess = new SortProcess(sp.getPageNo(), sp.getCtgrMain(), sp.getCtgrSub(),
						sp.getSortName());
				ItemBuySet = itemBuyService.BselectItemNoSubRvsSort(sortProcess);
				System.out.println("????????????????????????????????????");
			} else {
				SortProcess sortProcess = new SortProcess(sp.getPageNo(), sp.getCtgrMain(), sp.getCtgrSub(),
						sp.getSortName());
				ItemBuySet = itemBuyService.BselectItemYesSubRvsSort(sortProcess);
				System.out.println("???????????? ?????????????????????");
			}
		}

		return new ResponseEntity<List<ItemBuySet>>(ItemBuySet, HttpStatus.OK);
	}

	@ApiOperation(value = "?????? : viewHome ??????????????????")
	@GetMapping("viewHome")
	public ResponseEntity<List<ItemBuySet>> selectItemAllHome(@RequestParam(defaultValue = "1") int pageNo,
			@RequestParam(defaultValue = "ib_item_no") String sortName, @RequestParam(defaultValue = "down") String UD)
			throws Exception {
		List<ItemBuySet> ItemBuySet = null;
		SortProcess sp = new SortProcess((pageNo - 1) * 100, "", "", sortName);
		if (UD.equals("up")) {
			ItemBuySet = itemBuyService.BselectItemAllHomeUp(sp);	
			for(int i = 0; i < ItemBuySet.size(); i++) {
				ItemBuySet.get(i).setJoinerCnt(itemBuyService.BselectItemCntAP(ItemBuySet.get(i).getIbItemNo()));
			}
		} else {
			ItemBuySet = itemBuyService.BselectItemAllHomeDown(sp);
			for(int i = 0; i < ItemBuySet.size(); i++) {
				ItemBuySet.get(i).setJoinerCnt(itemBuyService.BselectItemCntAP(ItemBuySet.get(i).getIbItemNo()));
			}
		}
		return new ResponseEntity<List<ItemBuySet>>(ItemBuySet, HttpStatus.OK);
	}

	@ApiOperation(value = "?????? : ?????????????????????")
	@GetMapping("categoryCount")
	public ResponseEntity<Integer> selectCategoryCount(String ctgrMain, String ctgrSub) throws Exception {
		List<ItemCtgrCnt> result = null;
		if (ctgrSub == null) { // ?????? ????????? ?????????..
			ctgrSub = "-";
			result = itemBuyService.BselectCountByCtgrSub(new ItemCtgrSearch(ctgrMain, ctgrSub));
			if (result.size() == 0) {
				System.out.println("????????? ??????????????????, ????????????????????? ??????..(??????????????????, ??????????????? ?????????");
				return new ResponseEntity<Integer>(0, HttpStatus.OK);
			}
			if (result.get(0).getCntMain() == 0) {
				System.out.println("????????? ??????????????????, ????????????????????? ????????? ?????? 0???????");
				return new ResponseEntity<Integer>(0, HttpStatus.OK);
			}
			return new ResponseEntity<Integer>(result.get(0).getCntMain(), HttpStatus.OK);
		} else {
			result = itemBuyService.BselectCountByCtgrSub(new ItemCtgrSearch(ctgrMain, ctgrSub));
			if (result.size() == 0) {
				System.out.println("????????? ????????? ?????? ??? null!!");
				return new ResponseEntity<Integer>(0, HttpStatus.OK);
			}
//			System.out.println("??????????????? ?????? ????????????=" + result.get(0).getIsCategorySub() + ", ????????? ??????="+result.get(0).getCntSub());
			if (result.get(0).getCntSub() == 0) {
				System.out.println("????????????????????????, ?????? ????????? ?????? ???");
				return new ResponseEntity<Integer>(0, HttpStatus.OK);
			}
			return new ResponseEntity<Integer>(result.get(0).getCntSub(), HttpStatus.OK);
		}
	}

	/* R :: ?????? ??????(????????? ?????? ?????????) */
	@ApiOperation(value = "?????? : ????????? ????????????")
	@GetMapping("detail/images")
	public ResponseEntity<List<ItemPhoto>> selectItemImages(int ipItemNo) throws Exception {
		return new ResponseEntity<List<ItemPhoto>>(itemBuyService.BselectItemImages(ipItemNo), HttpStatus.OK);
	}

	@ApiOperation(value = "?????? : ????????? ????????? ????????? ??????(???????????????)")
	@GetMapping("/myItemIndexing")
	public ResponseEntity<?> selectItemListIndexing(int ibUserNo, @RequestParam(defaultValue = "1") int page)
			throws Exception {
		List<ItemBuy> items = itemBuyService.BselectItemListIndexing(ibUserNo, (page - 1) * 100);
		List<ItemPhotoSet> itemsphoto = new ArrayList<>();
		int itemValue = itemBuyService.BselectCountItemBuy(ibUserNo);

		for (ItemBuy ib : items) {
			itemsphoto.add(new ItemPhotoSet(ib, imageUploadService.selectItemPhotoList(ib.getIbItemNo()), itemValue));
		}
		if (items != null) {
			return new ResponseEntity<List<ItemPhotoSet>>(itemsphoto, HttpStatus.OK);
		}
		return new ResponseEntity<String>("?????? ??????", HttpStatus.NO_CONTENT);
	}

	@ApiOperation(value = "?????? : ?????? ????????? ?????? ?????? ??????")
	@GetMapping("/detail/inform")
	public ResponseEntity<ItemBuySet> selectItemOne(int ibItemNo) throws Exception {
		ItemBuySet result = itemBuyService.BselectItemOne(ibItemNo);
		System.out.println(result.toString());
		result.setJoinerCnt(itemBuyService.BselectItemCntAP(ibItemNo));
		return new ResponseEntity<ItemBuySet>(result, HttpStatus.OK);
	}
}
