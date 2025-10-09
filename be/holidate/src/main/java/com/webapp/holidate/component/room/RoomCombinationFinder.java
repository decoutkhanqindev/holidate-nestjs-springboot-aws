package com.webapp.holidate.component.room;

import com.webapp.holidate.entity.accommodation.room.Room;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Component chịu trách nhiệm tìm kiếm các tổ hợp phòng (room combinations)
 * phù hợp với yêu cầu của người dùng.
 * <p>
 * Lớp này sử dụng thuật toán đệ quy quay lui (backtracking) để khám phá tất cả
 * các khả năng và trả về những tổ hợp hợp lệ.
 */
@Component
public class RoomCombinationFinder {

  /**
   * Phương thức chính để khởi động quá trình tìm kiếm tổ hợp.
   *
   * @param candidates     Danh sách các loại phòng có sẵn đã được lọc sơ bộ.
   * @param targetAdults   Số người lớn yêu cầu.
   * @param targetChildren Số trẻ em yêu cầu.
   * @param targetRooms    Số lượng phòng mong muốn.
   * @return Một danh sách chứa tất cả các tổ hợp phòng hợp lệ (mỗi tổ hợp là một List<Room>).
   */
  public List<List<Room>> findCombinations(
    List<RoomCandidate> candidates,
    int targetAdults,
    int targetChildren,
    int targetRooms
  ) {
    List<List<Room>> allSolutions = new ArrayList<>();
    findRecursive(candidates, targetAdults, targetChildren, targetRooms, new ArrayList<>(), 0, allSolutions);
    return allSolutions;
  }

  /**
   * Hàm đệ quy chính sử dụng thuật toán backtracking để xây dựng các tổ hợp.
   *
   * @param candidates         Danh sách các loại phòng ứng viên.
   * @param targetAdults       Số người lớn mục tiêu.
   * @param targetChildren     Số trẻ em mục tiêu.
   * @param targetRooms        Số phòng mục tiêu.
   * @param currentCombination Tổ hợp đang được xây dựng trong mỗi lần đệ quy.
   * @param startIndex         Chỉ số bắt đầu trong danh sách candidates để tránh các tổ hợp trùng lặp.
   * @param allSolutions       Danh sách tổng để lưu trữ tất cả các kết quả hợp lệ.
   */
  private void findRecursive(
    List<RoomCandidate> candidates,
    int targetAdults,
    int targetChildren,
    int targetRooms,
    List<Room> currentCombination,
    int startIndex,
    List<List<Room>> allSolutions
  ) {
    // Điều kiện dừng 1: Nếu tổ hợp đã đủ số phòng yêu cầu.
    if (currentCombination.size() == targetRooms) {
      // Kiểm tra xem tổ hợp này có đủ sức chứa không.
      if (isCombinationValid(currentCombination, targetAdults, targetChildren)) {
        // Nếu hợp lệ, thêm một bản sao của nó vào danh sách kết quả.
        allSolutions.add(new ArrayList<>(currentCombination));
      }
      // Dừng nhánh này vì đã đủ số phòng.
      return;
    }

    // Vòng lặp để thử thêm từng loại phòng vào tổ hợp.
    for (int i = startIndex; i < candidates.size(); i++) {
      RoomCandidate candidate = candidates.get(i);

      // Đếm số lượng phòng của loại này đã có trong tổ hợp hiện tại.
      long countOfThisRoomTypeInCombination = currentCombination.stream()
        .filter(room -> room.getId().equals(candidate.getRoom().getId()))
        .count();

      // Nếu vẫn có thể thêm phòng loại này (số lượng chưa vượt quá số phòng có sẵn).
      if (countOfThisRoomTypeInCombination < candidate.getAvailableCount()) {
        // 1. Lựa chọn: Thêm phòng vào tổ hợp.
        currentCombination.add(candidate.getRoom());

        // 2. Khám phá: Đệ quy để tìm các lựa chọn tiếp theo.
        // Bắt đầu từ index 'i' để có thể chọn lại chính loại phòng này.
        findRecursive(candidates, targetAdults, targetChildren, targetRooms, currentCombination, i, allSolutions);

        // 3. Quay lui (Backtrack): Gỡ bỏ lựa chọn vừa rồi để thử phương án khác.
        currentCombination.removeLast();
      }
    }
  }

  /**
   * Kiểm tra xem một tổ hợp phòng đã hoàn chỉnh có đáp ứng đủ sức chứa không.
   *
   * @param combination    Một tổ hợp phòng có đủ số lượng phòng yêu cầu.
   * @param targetAdults   Số người lớn yêu cầu.
   * @param targetChildren Số trẻ em yêu cầu.
   * @return true nếu tổ hợp hợp lệ, ngược lại false.
   */
  private boolean isCombinationValid(List<Room> combination, int targetAdults, int targetChildren) {
    int totalAdultsCapacity = 0;
    int totalCapacity = 0;

    for (Room room : combination) {
      totalAdultsCapacity += room.getMaxAdults();
      totalCapacity += room.getMaxAdults() + room.getMaxChildren();
    }

    // Điều kiện hợp lệ:
    // 1. Tổng sức chứa người lớn phải lớn hơn hoặc bằng số người lớn yêu cầu.
    // 2. Tổng sức chứa (người lớn + trẻ em) phải lớn hơn hoặc bằng tổng số khách.
    return totalAdultsCapacity >= targetAdults && totalCapacity >= (targetAdults + targetChildren);
  }
}
