import "./App.css";
import { useEffect, useState, useCallback, useRef } from "react";
import { JsonData, UserDetails } from "./types";
import { searchUser } from "./api";

const DEBOUNCE_TIME = 300;

const fetchData = searchUser();

export default function App() {
  const [matchData, setMatchData] = useState<UserDetails[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const pageNumber = useRef(1);
  const intersectionRef = useRef<IntersectionObserver>();
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState("");
  const [moreDataToFetch, setMoreDataToFetch] = useState(true);

  const handleChange = useCallback(async (e: any) => {
    const val = e.target.value;
    // console.log("val is: ", val);
    setInputVal(val);
  }, []);

  const getData = async (appendData: boolean) => {
    setLoading(true);
    try {
      const matchedData = (await fetchData(
        inputVal,
        DEBOUNCE_TIME,
        pageNumber.current
      )) as UserDetails[];
      // console.log({ matchedData });
      // console.log({ inputVal });
      if (appendData) {
        setMatchData([...matchData, ...matchedData]);
      } else {
        setMatchData(matchedData);
      }
    } catch (error) {
      setCustomError(() => "Something went wrong, please try again later");
      setMatchData([]);
      // console.log("Error in getData:", error);
    } finally {
      setLoading(false);
    }
  };

  // console.log("inputval on dom is: ", inputVal);

  useEffect(() => {
    pageNumber.current = 1;
    getData(false);
    setCustomError("");
  }, [inputVal]);

  useEffect(() => {
    if (matchData.length == 0 && inputVal !== "" && !loading) {
      setMoreDataToFetch(false);
      setCustomError(() => {
        // console.log("input val is : ", inputVal);
        return "Users with this username doesnt exist";
      });
    } else {
      setMoreDataToFetch(true);
      setCustomError("");
    }
  }, [matchData, inputVal, loading]);

  const clickedSuggestion = useCallback((e: any) => {
    const val = e.target.textContent;
    setInputVal(val);
    // console.log(val);
  }, []);

  const attachIntersection = useCallback(
    async (node: HTMLTableRowElement) => {
      // console.log({ node });
      if (loading || !moreDataToFetch) {
        return;
      }

      if (intersectionRef.current) {
        intersectionRef.current.disconnect();
      }

      intersectionRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          pageNumber.current += 1;
          getData(true);
        }
      });

      if (node) {
        // console.log("node is present");
        // console.log({ node });
        intersectionRef.current.observe(node);
      } else {
        // If there are no more data to fetch, disconnect the observer.
        intersectionRef.current.disconnect();
      }

      return intersectionRef;
    },
    [loading, inputVal]
  );

  return (
    <div className="App">
      <input
        type="text"
        onChange={handleChange}
        value={inputVal}
        placeholder="Enter Github User Name"
      />
      <table className={"tableStyle"} onClick={clickedSuggestion}>
        <tbody>
          {matchData.length
            ? matchData.map((row, ind) => {
                return (
                  <tr
                    key={`${row}${ind}`}
                    ref={
                      matchData.length - 1 === ind ? attachIntersection : null
                    }
                  >
                    <td>{row.userName}</td>
                    <td>
                      <img
                        src={row.avatar}
                        width={"32px"}
                        height={"32px"}
                        alt=""
                      />
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
      {loading && <h3>{"LOADING....."}</h3>}
      {customError !== "" && <h3 className={"customError"}>{customError}</h3>}
    </div>
  );
}
