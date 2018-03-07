
const assert = require('assert');

const target = require("../parser")

suite("Purify CSS parser tests", function () {

    suite("get CSS", () => {
        test("shoud return empty array when input is empty", function () {
            let input = "";
            let actual = target.getCss(input)
            let expected = [];
            assert.deepEqual(actual, expected);
        });

        test("shoud return corrent rules when input is correct", function () {
            let input = `
            ________________________________________________
            |
            |   PurifyCSS - Rejected selectors:  
            |   .useless1
            |	.useless2
            |	.useless3
            |
            ________________________________________________
            
            SOME USELESS INFO HERE
            `;
            let actual = target.getCss(input)
            let expected = [".useless1", ".useless2", ".useless3"];
            assert.deepEqual(actual, expected);
        });
    })

    suite("Comparison", () => {
        test("should return correct difference", () => {
            let all = [
                { type: "rule", selectors: ["one"], position: {} },
                { type: "rule", selectors: ["two"], position: {} },
                { type: "rule", selectors: ["three"], position: {} }
            ]

            let valid = [
                { type: "rule", selectors: ["one"], position: {} },
                { type: "rule", selectors: ["three"], position: {} }];

            let actual = target.getDifference(all, valid);
            let expected = [{ type: "rule", selectors: ["two"], position: {} }]
            assert.deepEqual(actual, expected)
        })
    })

});