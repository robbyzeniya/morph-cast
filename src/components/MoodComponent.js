import { useEffect, useRef, useState } from "react";
import "./componentCSS/moodComponent.css"
import Chart from "chart.js/auto";
import { PolarArea } from "react-chartjs-2";
const MoodComponent = () => {
  const grid = useRef(undefined);
  const pin_wrap = useRef(undefined);
  const pin = useRef(undefined);
  const [gridN, setGridN] = useState(38)
  const crtDisableTimeout = useRef(undefined);
  const [obstructive, setObstructive] = useState(0)
  const [lowControl, setLowControl] = useState(0)
  const [conductive, setConductive] = useState(0)
  const [highControl, setHighControl] = useState(0)

  const [populateData, setPopulateData] = useState([])
  const calcObj = (total) => {
    return Object.values(total).reduce((a, b) => a + b, 0)
  }

  const summaryPercentage = (data, key) => {

    let sum = data?.reduce((s, { value }) => s + value, 0),
      result = data?.map(({ name, value }) => ({ name, percentage: isNaN(value * 100 / sum) ? 0 : value * 100 / sum }));
    let res = result?.find((e) => e.name == key)
    return res?.percentage
  }

  useEffect(() => {
    grid.current = document.querySelector("#grid");
    pin_wrap.current = document.querySelector(".pin_wrap");
    pin.current = document.querySelector(".pin");
    if (grid.current && pin_wrap.current) {
      bindEvent();
    }
    function resetTimeout() {
      let to = crtDisableTimeout.current;
      clearTimeout(to);
      to = setTimeout(() => {
        hidePin()
      }, 3000)

      crtDisableTimeout.current = to;
    }

    function bindEvent() {
      resetTimeout();
      window.addEventListener("CY_FACE_AROUSAL_VALENCE_RESULT", fn);
      window.addEventListener("resize", fn2);
    }


    function fn(evt) {

      let quadrant = evt.detail.output.quadrant;
      const total = calcObj(evt.detail.output.affects98)

      let _temp_obstructive = 0
      let _temp_highControl = 0
      let _temp_conductive = 0
      let _temp_lowcontrol = 0

      if (quadrant === "Obstructive") {
        _temp_obstructive = total

      }
      if (quadrant === "High Control") {
        _temp_highControl = total
      }
      if (quadrant === "Conductive") {
        _temp_conductive = total
      }

      if (quadrant === "Low Control") {
        _temp_lowcontrol = total
      }

      let data = [
        {
          name: 'obstructive',
          value: _temp_obstructive,
        },
        {
          name: 'lowControl',
          value: _temp_lowcontrol,
        },
        {
          name: 'conductive',
          value: _temp_conductive,
        },
        {
          name: 'highControl',
          value: _temp_highControl,
        }
      ]

      setObstructive(summaryPercentage(data, 'obstructive'))
      setLowControl(summaryPercentage(data, 'lowControl'))
      setConductive(summaryPercentage(data, 'conductive'))
      setHighControl(summaryPercentage(data, 'highControl'))

      showPin();
      setEmotion(evt.detail.output);

      resetTimeout();
    };

    function fn2() {
      setDim();
    };

    function setDim() {
      if (!grid.current || grid.current.clientWidth === 0) {
        setTimeout(() => {
          setDim();
        }, 10);
      } else {
        pin_wrap.current.style.width = grid.clientWidth + "px";
        pin_wrap.current.style.height = grid.clientHeight + "px";
      }
    }

    //emotion position
    function setEmotion({ arousal = 0, valence = 0 }) {
      let { x, y } = calcCoorinate({ valence, arousal });
      x = Math.max(x, 5.15); // check img ratio to avoid ellipse
      y = Math.max(y, 6);

      // console.log('Position Emotion', {
      //   'x': x,
      //   'y': y
      // })
      setPinPosition(x, y);
    }

    function calcCoorinate({ valence = 0, arousal = 0 }) {
      const img_outer_width = 800;
      const img_inner_width = 598;
      const img_x_offset = 101;

      const img_outer_height = 686;
      const img_inner_height = 598;
      const img_y_offset = 45;

      const normalized = (z) => (z + 1) / 2;

      return {
        x:
          (100 * (img_x_offset + img_inner_width * normalized(valence))) /
          img_outer_width,
        y:
          (100 * (img_y_offset + img_inner_height * normalized(arousal))) /
          img_outer_height,
      };
    }

    function setPinPosition(x, y) {
      pin.current.style.left = `${x - 5.15}%`; // check img ratio to avoid ellipse
      pin.current.style.bottom = `${y - 6}%`;
    }

    function showPin() {
      pin.current.style.opacity = 0.7;
    }

    function hidePin() {
      pin.current.style.opacity = 0;
    }

  }, [grid, pin, pin_wrap, populateData]);


  const data = {
    labels: ['High Control', 'Conductive', 'Low Control', 'Obstructive'],
    datasets: [
      {
        label: '# of Votes',
        data: [highControl, conductive, lowControl, obstructive],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
      },
      r: {
        pointLabels: {
          display: true,
          centerPointLabels: true,
          font: {
            size: 18
          }
        },
        min: 0,
        max: 100,
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sample Chart Js'
      }
    }

  }
  return (
    <>

      <p style={{ fontSize: "20px" }}>Mood Component:</p>
      <div style={{ display: 'flex' }}>
        <div style={{ position: "relative", height: "550px", width: "600px" }}>
          <div className="wrapper" id="grid">
            {(gridN === 38) && <img alt="" src="baseGraph.png" style={{ width: "100%", height: "100%" }} />}
            {(gridN === 98) && <img alt="" src="advancedGraph.png" style={{ width: "100%", height: "100%" }} />}
            <div className="pin_wrap">
              <div className="pin"></div>
            </div>
          </div>
        </div>
        <div style={{ width: '500px' }}>
          <PolarArea type='polarArea'
            options={options} data={data} />;
        </div>
      </div>
      {/* <div>
        <button onClick={() => { setGridN(38) }} disabled={gridN === 38}>38 Affects</button>
        <button onClick={() => { setGridN(98) }} disabled={gridN === 98}>98 Affects</button>
      </div> */}
      <div>
        <button>Render Caps</button>
      </div>
    </>
  );
};

export default MoodComponent;
