import { Interval, Note } from "./core";

describe("Intervals", () => {
    it("should be a unison", () => { testInterval("a4", "a4", "P", 1); });
    it("should be a minor second", () => { testInterval("fs3", "g3", "m", 2); });
    it("should be a major second", () => { testInterval("d3", "e3", "M", 2); });
    it("should be a minor third", () => { testInterval("b4", "d5", "m", 3); });
    it("should be a major third", () => { testInterval("c4", "e4", "M", 3); });
    it("should be a perfect fourth", () => { testInterval("a4", "d5", "P", 4); });
    it("should be a diminished fifth", () => { testInterval("c2", "gf2", "d", 5); });
    it("should be a perfect fifth", () => { testInterval("g5", "d6", "P", 5); });
    it("should be a augmented fifth", () => { testInterval("a5", "es6", "A", 5); });
    it("should be a minor sixth", () => { testInterval("b3", "g4", "m", 6); });
    it("should be a major sixth", () => { testInterval("ef4", "c5", "M", 6); });
    it("should be a minor seventh", () => { testInterval("e3", "d4", "m", 7); });
    it("should be a major seventh", () => { testInterval("e3", "ds4", "M", 7); });
});

function testInterval(note1: string, note2: string, quality: string, value: number) {
    const referenceNote = new Note(note1);
    const comparisonNote = new Note(note2);

    const interval = new Interval(referenceNote, comparisonNote);

    expect(interval.quality).toBe(quality);
    expect(interval.value).toBe(value);
}