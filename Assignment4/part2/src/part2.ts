// PPL 2023 HW4 Part2

// Q 2.1

// Specify the return type.
export const delayedSum = async (a: number, b: number, delay: number) =>
  new Promise((resolve) => setTimeout(() => resolve(a + b), delay));

export const testDelayedSum = () => {
  const start = Date.now();
  delayedSum(1, 2, 1000).then(() => {
    const end = Date.now();
    return end - start >= 1000;
  });
};

// Q 2.2

// Values returned by API calls.
export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

// When invoking fetchData(postsUrl) you obtain an Array Post[]
// To obtain an array of posts
export const postsUrl = "https://jsonplaceholder.typicode.com/posts";

// Append the desired post id.
export const postUrl = "https://jsonplaceholder.typicode.com/posts/";

// When invoking fetchData(invalidUrl) you obtain an error
export const invalidUrl = "https://jsonplaceholder.typicode.com/invalid";

// Depending on the url - fetchData can return either an array of Post[] or a single Post.
// Specify the return type without using any.
export const fetchData = async (url: string) =>
  fetch(url).then((res) => {
    if (res.ok) return res.json();
    else throw new Error("Error");
  });

export const testFetchData = () => {
  fetchData(postsUrl)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  fetchData(postUrl + "1")
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  fetchData(invalidUrl)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
};

// Q 2.3

// Specify the return type.
export const fetchMultipleUrls = async (urls: string[]) => Promise.all(urls.map((url) => fetchData(url)));

export const testFetchMultipleUrls = () =>
  fetchMultipleUrls(Array.from({ length: 20 }, (_, i) => i + 1).map((i) => postUrl + i))
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
