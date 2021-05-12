package com.egemmerce.hc.repository.dto;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity @EqualsAndHashCode(of = "rapNo")
@Builder @AllArgsConstructor @NoArgsConstructor
public class ReverseAuctionParticipant {
	
    @Id
	private int rapNo;
	private int rapItemNo;
	private int rapUserNo;
	private int rapBid;
	private LocalDateTime rapDate;
	private String rapAddress;
	
	public void generaterapDate() {
		this.rapDate=LocalDateTime.now();
	}

	public int getRapNo() {
		return rapNo;
	}

	public void setRapNo(int rapNo) {
		this.rapNo = rapNo;
	}

	public int getRapItemNo() {
		return rapItemNo;
	}

	public void setRapItemNo(int rapItemNo) {
		this.rapItemNo = rapItemNo;
	}

	public int getRapUserNo() {
		return rapUserNo;
	}

	public void setRapUserNo(int rapUserNo) {
		this.rapUserNo = rapUserNo;
	}

	public int getRapBid() {
		return rapBid;
	}

	public void setRapBid(int rapBid) {
		this.rapBid = rapBid;
	}

	public LocalDateTime getRapDate() {
		return rapDate;
	}

	public void setRapDate(LocalDateTime rapDate) {
		this.rapDate = rapDate;
	}

	public String getRapAddress() {
		return rapAddress;
	}

	public void setRapAddress(String rapAddress) {
		this.rapAddress = rapAddress;
	}
}