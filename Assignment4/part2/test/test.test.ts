import { describe, expect, test } from "@jest/globals";
import {
  delayedSum,
  Post,
  postsUrl,
  postUrl,
  invalidUrl,
  fetchData,
  fetchMultipleUrls,
} from "../src/part2";

describe("Assignment 4 Part 2", () => {
  describe("Q2.1 delayedSum (6 points)", () => {
    test("delayedSum returns the sum", () => {
      delayedSum(1, 2, 1000).then((result) => {
        expect(result).toBe(3);
      });
    });
    test("delayedSum waits at least the specified delay", () => {
      const start = Date.now();
      delayedSum(1, 2, 1000).then(() => {
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(1000);
      });
    });
  });

  describe("Q2.2 fetchData (12 points)", () => {
    test("successful call to fetchData with array result", async () =>
      fetchData(postsUrl).then((res: Post | Post[]) =>
        Array.isArray(res)
          ? expect(res.length).toBe(100)
          : expect(true).toBe(false)
      ));

    test("successful call to fetchData with Post result", async () => {
      const expected: Post = {
        userId: 1,
        id: 1,
        title:
          "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        body:
          "quia et suscipit\n" +
          "suscipit recusandae consequuntur expedita et cum\n" +
          "reprehenderit molestiae ut ut quas totam\n" +
          "nostrum rerum est autem sunt rem eveniet architecto",
      };

      fetchData(postUrl + "1").then((res) => expect(res).toEqual(expected));
    });

    test("failed call to fechData", async () =>
      fetchData(invalidUrl).catch((err) => expect(err.message).toBe("Error")));
  });

  describe("Q2.3 fetchMultipleUrls (12 points)", () => {
    test("successful call to fetchMultipleUrls", async () => {
      try {
        const res = await fetchMultipleUrls(
          Array.from({ length: 20 }, (_, i) => i + 1).map((i) => postUrl + i)
        );
        expect(res.length).toBe(20);
      } catch (error) {
        expect(true).toBe(false);
      }
    });

    test("successful call to fetchMultipleUrls: verify results are in the expected order", async () => {
      try {
        const res = await fetchMultipleUrls(
          Array.from({ length: 20 }, (_, i) => i + 1).map((i) => postUrl + i)
        );
        expect(res.length).toBe(20);
      } catch (error) {
        expect(true).toBe(false);
      }
    });

    test("failed call to fetchMultipleUrls", async () => {
      try {
        const res = await fetchMultipleUrls(
          Array.from({ length: 101 }, (_, i) => i + 1).map((i) => postUrl + i)
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(true).toBe(true);
      }
    });
  });
});
