import "./App.css";
import { useEffect, useState, useCallback } from "react";

const GITHUB_TOKEN =
  "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";

interface JsonData {
  total_count: number;
  incomplete_results: boolean;
  items: [
    {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      gravatar_id: string;
      url: string;
      html_url: string;
      followers_url: string;
      following_url: string;
      gists_url: string;
      starred_url: string;
      subscriptions_url: string;
      organizations_url: string;
      repos_url: string;
      events_url: string;
      received_events_url: string;
      type: string;
      site_admin: boolean;
      score: number;
    }
  ];
}

function searchUser() {
  let timeout: NodeJS.Timeout;

  return function (val: string, time: number) {
    return new Promise(async (resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
        // console.log("clearing timer");
      }

      timeout = setTimeout(async () => {
        // console.log("fetch called");

        try {
          const data = await fetch(
            `https://api.github.com/search/users?q=${val}&order=desc&sort=followers`,
            {
              headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
              },
            }
          );

          const jsonData: JsonData = await data.json();
          const users = jsonData.items.map((user) => user.login);
          resolve(users);
        } catch (error) {
          console.error("Error fetching data:", error);
          reject(error);
        }
      }, time);
    });
  };
}

const fetchData = searchUser();

export default function App() {
  const [matchData, setMatchData] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState<string>("");

  const handleChange = useCallback(async (e: any) => {
    const val = e.target.value;
    // console.log("val is: ", val);
    setInputVal(val);
    const matchedData = (await fetchData(val, 1500)) as string[];
    setMatchData(matchedData);
  }, []);

  const clickedSuggestion = useCallback((e: any) => {
    const val = e.target.textContent;
    setInputVal(val);
    console.log(val);
  }, []);

  return (
    <div className="App">
      <input type="text" onChange={handleChange} value={inputVal} />
      <table onClick={clickedSuggestion}>
        <tbody>
          {matchData.length
            ? matchData.map((row, ind) => {
                return (
                  <tr key={`${row}${ind}`}>
                    <td>{row}</td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
}
