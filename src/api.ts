import { JsonData } from "./types";

export function searchUser() {
  let timeout: NodeJS.Timeout;
  let controller: AbortController;

  return function (val: string, time: number, pageNumber: number) {
    if (controller && controller.signal) {
      //   console.log("aborting request");
      controller.abort();
    }

    if (!val) {
      pageNumber = 1;
      return Promise.resolve([]);
    }

    controller = new AbortController();

    return new Promise(async (resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        try {
          if (controller && controller?.signal?.aborted) {
            // console.log("came here got resolved early");
            resolve([]);
            return;
          }

          //   console.log("came inside promise");

          const data = await fetch(
            `https://api.github.com/search/users?q=${val}&order=desc&sort=followers&page=${pageNumber}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
              },
              signal: controller.signal,
            }
          );

          if (!data.ok) {
            throw new Error(`Request failed with status ${data.status}`);
          }

          const jsonData: JsonData = await data.json();
          const users = jsonData.items.map((user) => ({
            userName: user.login,
            avatar: user.avatar_url,
          }));

          resolve(users);
        } catch (error) {
          if (controller && controller?.signal?.aborted === false) {
            // console.log("controller values: ");
            // console.log({ controller });

            reject(error);
          }

          resolve([]);
          //   console.log("Error fetching data:", error);
        }
      }, time);
    });
  };
}
