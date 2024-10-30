// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title Counters
 * @dev Provides counters that can only be incremented, decremented, or reset. Useful for tracking elements count,
 * issuing IDs, or counting items with minimal overhead.
 */
library Counters {
    struct Counter {
        uint256 _value; // Default to 0
    }

    /**
     * @dev Returns the current value of the counter.
     * @param counter Counter to get the current value of.
     * @return uint256 The current value of the counter.
     */
    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    /**
     * @dev Increment the counter value by 1.
     * @param counter Counter to increment.
     */
    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    /**
     * @dev Decrement the counter value by 1. Reverts if the counter is 0.
     * @param counter Counter to decrement.
     */
    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    /**
     * @dev Resets the counter value to 0.
     * @param counter Counter to reset.
     */
    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}
