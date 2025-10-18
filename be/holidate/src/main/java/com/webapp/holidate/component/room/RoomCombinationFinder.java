package com.webapp.holidate.component.room;

import com.webapp.holidate.entity.accommodation.room.Room;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

// Component to find valid room combinations based on user requirements
// Uses backtracking algorithm to explore all possible combinations
@Component
public class RoomCombinationFinder {
  // Find all valid room combinations for given requirements
  public List<List<Room>> findCombinations(
    List<RoomCandidate> candidates,
    int targetAdults,
    int targetChildren,
    int targetRooms
  ) {
    // Step 1: Initialize list to store all valid combinations
    List<List<Room>> allSolutions = new ArrayList<>();

    // Step 2: Start recursive backtracking search
    findRecursive(candidates, targetAdults, targetChildren, targetRooms, new ArrayList<>(), 0, allSolutions);

    // Step 3: Return all found valid combinations
    return allSolutions;
  }

  // Recursive method using backtracking algorithm to build combinations
  private void findRecursive(
    List<RoomCandidate> candidates,
    int targetAdults,
    int targetChildren,
    int targetRooms,
    List<Room> currentCombination,
    int startIndex,
    List<List<Room>> allSolutions
  ) {
    // Step 1: Check if combination has enough rooms (base case)
    if (currentCombination.size() == targetRooms) {
      // Validate if this combination can accommodate all guests
      if (isCombinationValid(currentCombination, targetAdults, targetChildren)) {
        // Add a copy of valid combination to results
        allSolutions.add(new ArrayList<>(currentCombination));
      }
      // Stop this branch since we have enough rooms
      return;
    }

    // Step 2: Try adding each room type to current combination
    for (int i = startIndex; i < candidates.size(); i++) {
      RoomCandidate candidate = candidates.get(i);

      // Step 3: Count how many rooms of this type are already in combination
      long countOfThisRoomTypeInCombination = currentCombination.stream()
        .filter(room -> room.getId().equals(candidate.getRoom().getId()))
        .count();

      // Step 4: Check if we can still add more rooms of this type
      if (countOfThisRoomTypeInCombination < candidate.getAvailableCount()) {
        // Step 5a: Choose - Add room to combination
        currentCombination.add(candidate.getRoom());

        // Step 5b: Explore - Recursively find next choices
        // Start from index 'i' to allow selecting same room type again
        findRecursive(candidates, targetAdults, targetChildren, targetRooms, currentCombination, i, allSolutions);

        // Step 5c: Backtrack - Remove last choice to try other options
        currentCombination.removeLast();
      }
    }
  }

  // Check if room combination can accommodate all guests
  private boolean isCombinationValid(List<Room> combination, int targetAdults, int targetChildren) {
    // Step 1: Handle empty combination case
    if (combination.isEmpty()) {
      // Only valid if no guests are required
      return targetAdults == 0 && targetChildren == 0;
    }

    // Step 2: Calculate total capacity of all rooms
    int totalAdultsCapacity = 0;
    int totalCapacity = 0;

    for (Room room : combination) {
      // Add adult capacity from each room
      totalAdultsCapacity += room.getMaxAdults();
      // Add total capacity (adults + children) from each room
      totalCapacity += room.getMaxAdults() + room.getMaxChildren();
    }

    // Step 3: Check if combination meets requirements
    // Condition 1: Adult capacity must be >= required adults
    // Condition 2: Total capacity must be >= total guests
    return totalAdultsCapacity >= targetAdults && totalCapacity >= (targetAdults + targetChildren);
  }
}
