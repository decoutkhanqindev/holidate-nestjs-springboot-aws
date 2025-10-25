package com.webapp.holidate.service.accommodation.room;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.discount.Discount;
import com.webapp.holidate.entity.discount.SpecialDayDiscount;
import com.webapp.holidate.entity.special_day.SpecialDay;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.accommodation.room.RoomInventoryRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.repository.discount.SpecialDayDiscountRepository;
import com.webapp.holidate.repository.special_day.SpecialDayRepository;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.utils.DateTimeUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DynamicPricingService {
  RoomRepository roomRepository;
  RoomInventoryRepository inventoryRepository;
  SpecialDayRepository specialDayRepository;
  SpecialDayDiscountRepository specialDayDiscountRepository;

  @NonFinal
  @Value(AppProperties.DYNAMIC_PRICING_LOOK_AHEAD_MILLIS)
  long dynamicPricingLookAheadMillis;

  @NonFinal
  @Value(AppProperties.WEEKEND_PRICE_MULTIPLIER)
  double weekendPriceMultiplier;

  @Transactional
  public void applyDynamicPricing() {
    LocalDate startDate = LocalDate.now();
    int days = DateTimeUtils.millisToDays(dynamicPricingLookAheadMillis);
    LocalDate endDate = startDate.plusDays(days);

    List<Room> rooms = roomRepository.findAll();
    Map<LocalDate, SpecialDay> specialDayMap = specialDayRepository.findAllByDateBetween(startDate, endDate)
      .stream()
      .collect(Collectors.toMap(SpecialDay::getDate, specialDay -> specialDay));

    List<RoomInventory> inventoriesToUpdate = new ArrayList<>();

    for (Room room : rooms) {
      List<RoomInventory> inventories = inventoryRepository.findAllByRoomIdAndDateBetween(room.getId(), startDate, endDate);

      for (RoomInventory inventory : inventories) {
        LocalDate currentDate = inventory.getId().getDate();
        DayOfWeek dayOfWeek = currentDate.getDayOfWeek();

        double newPrice;
        double basePrice = room.getBasePricePerNight();

        boolean isSpecialDay = specialDayMap.containsKey(currentDate);
        boolean isWeekend = dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;

        if (isSpecialDay) {
          SpecialDay specialDay = specialDayMap.get(currentDate);
          SpecialDayDiscount specialDayDiscount = specialDayDiscountRepository.findBySpecialDayIdWithDiscount(specialDay.getId())
            .orElseThrow(() -> new AppException(ErrorType.SPECIAL_DAY_DISCOUNT_NOT_FOUND));
          Discount discount = specialDayDiscount.getDiscount();
          log.info("Applying special day discount of {}% for date {}", discount.getPercentage(), currentDate);
          newPrice = basePrice * (1 - discount.getPercentage() / 100);
        } else if (isWeekend) {
          log.info("Applying weekend price multiplier of {} for date {}", weekendPriceMultiplier, currentDate);
          newPrice = basePrice * weekendPriceMultiplier;
        } else {
          log.info("No special pricing for date {}, setting base price {}", currentDate, basePrice);
          newPrice = basePrice;
        }

        boolean priceChanged = Double.compare(inventory.getPrice(), newPrice) != 0;
        if (priceChanged) {
          log.info("Updating price for room {} on date {}: old price = {}, new price = {}",
            room.getId(), currentDate, inventory.getPrice(), newPrice);
          inventory.setPrice(newPrice);
          log.info("Updated inventory: {}", inventory);
          inventoriesToUpdate.add(inventory);
        }
      }
    }

    boolean hasInventoriesToUpdate = !inventoriesToUpdate.isEmpty();
    if (hasInventoriesToUpdate) {
      log.info("Saving {} updated inventories", inventoriesToUpdate.size());
      inventoryRepository.saveAll(inventoriesToUpdate);
    }
  }
}
