import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPersonalDeliveryFee,
  PERSONAL_DELIVERY_FEE_BANDS,
} from "./personalDeliveryPricing.constants";

describe("personal delivery pricing", () => {
  it("uses every band boundary as an inclusive upper bound", () => {
    for (const band of PERSONAL_DELIVERY_FEE_BANDS.slice(0, -1)) {
      assert.equal(getPersonalDeliveryFee(band.maxDistanceKm), band.feeRwf);
    }
  });

  it("moves to the next fee immediately above each boundary", () => {
    const finiteBands = PERSONAL_DELIVERY_FEE_BANDS.slice(0, -1);
    finiteBands.forEach((band, index) => {
      assert.equal(
        getPersonalDeliveryFee(band.maxDistanceKm + 0.0001),
        PERSONAL_DELIVERY_FEE_BANDS[index + 1].feeRwf,
      );
    });
  });

  it("rejects unusable route distances", () => {
    assert.throws(() => getPersonalDeliveryFee(0));
    assert.throws(() => getPersonalDeliveryFee(Number.NaN));
  });
});
