import "./styles.css";
import { sampleParagraphs } from "./data.js";
import { useState, useEffect } from "react";

export default function App() {
  return (
    <div className="App">
      <h1>Typing Speed Evaluator </h1>
      <Description />
      <TypeTest text={sampleParagraphs} />
    </div>
  );
}

function Description() {
  return (
    <div>
      <div>
        <h4> Evaluation begins when you start typing! </h4>
      </div>
      <div>
        <h4>
          Evaluation ends when all text is entered correctly OR if the entire
          sample text is cleared.
        </h4>
      </div>
    </div>
  );
}

function TypeTest(props) {
  const { text = [] } = props;
  const [count, setCount] = useState(0);
  const [source, setSource] = useState([
    'Click "Change Text" to receive your first paragraph.'
  ]);
  const [compare, setCompare] = useState([]);
  const [startTime, setStartTime] = useState([]);
  const [temp, setTemp] = useState([]);
  ///////////////////////////////Elapsed Time components///////////////////////////////
  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [seconds, setSeconds] = useState(0);

  const toggleRunning = () => {
    // Toggle stopwatch running state to True
    setIsRunning(!isRunning);
  };
  const handleTimeReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  useEffect(() => {
    // Use this effect to reset the start date
    if (!isRunning) return null;
    if (isRunning && seconds === 0) {
      setStartDate(new Date());
    }
  }, [isRunning, seconds]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        const now = new Date();
        setSeconds(
          Math.floor(Math.abs((now.getTime() - startDate.getTime()) / 1000))
        );
      }, 500);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearTimeout(interval);
  }, [isRunning, seconds, startDate]);
  /////////////////////////////////////////////////////////////////////////////////////

  function countWordsPerMin(compare, seconds) {
    if (seconds > 0) {
      const count = compare.split(/\s+/).length;
      return Math.trunc((count / seconds) * 60);
    } else {
      return 0;
    }
  }

  function getTextCompare(source, compare) {
    /* 
    This function is called in handleCompareChange because whenever the user types in
    compareText, the source should be udpated with HTML attributes (the colors). 
    So, in handleCompareChange we setSource(getTextCompare(temp, value)); and "temp"
    is a state variable that has the initial source produced from the button.
    */
    const s = source.slice(0, compare.length);
    const formattedSource = [...s].map((letter, index) => (
      <span className="match">
        {letter !== compare[index] ? (
          <span className="matchError">{letter}</span>
        ) : (
          letter
        )}
      </span>
    ));
    return (
      // returns HTML. In other words, the source text is now with color (red or green)
      <div>
        {formattedSource}
        {source.slice(compare.length)}
      </div>
    );
  }

  function countErrors(source, compare) {
    // Generate an array from text where new array contains true if
    // matches character in second string, or false if does not match,
    // and count (reduce) the number of array elements with false
    return [...compare]
      .map((letter, index) => letter === source[index])
      .reduce((badTotal, val) => (!val ? badTotal + 1 : badTotal), 0);
  }

  function formatDate(d) {
    return `${d.toLocaleTimeString()}`;
  }

  function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const handleSourceChange = (e) => {
    setCount(() => getRandomInteger(0, text.length - 1)); // changes the sourceText randomly
    setCompare([]);
    setTemp(text[count]);
    setSource(text[count]);
    setIsStarted(true); // unlocks the compareText area AFTER the button has been clicked
    handleTimeReset(); // resets the startedTime after each button click
  };

  const handleCompareChange = (e) => {
    const { value } = e.target;
    setCompare(value);
    if (!isRunning) {
      // this If statement sets the "Started:" time after the first user entry in compareText
      setStartTime(formatDate(new Date()));
      toggleRunning();
    }
    if (temp.length === value.length) {
      // this If statement handles when the user has completed the test
      setIsStarted(false);
      setIsRunning(false);
    }
    setSource(getTextCompare(temp, value)); // this updates the matches/non-matches
  };

  return (
    <div>
      <div>
        <button onClick={handleSourceChange}>Change Text</button>
      </div>
      <div>
        <div className="sourceWrapper">
          <div className="sourceText">{source}</div>
        </div>
        <textarea
          id="compareText"
          rows="10"
          cols="40"
          value={compare}
          onChange={handleCompareChange}
          placeholder="Type here to begin!"
          disabled={!isStarted}
        />
      </div>
      <div>
        <div>Started: {startTime}</div>
        <div>Elapsed Time (Sec): {seconds}</div>
        <div>Words/min: {countWordsPerMin(compare, seconds)} </div>
        <div>Errors: {countErrors(temp, compare)}</div>
      </div>
    </div>
  );
}
