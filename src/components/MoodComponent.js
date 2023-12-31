import { useEffect, useRef, useState } from "react";
import "./componentCSS/moodComponent.css"
import Chart from "chart.js/auto";
import { PolarArea, Line } from "react-chartjs-2";
import dayjs from 'dayjs';
import Button from 'react-bootstrap/Button';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
const MoodComponent = () => {

  const MOOD = 1
  const EMOTION = 2
  const ENGANGMENT = 2


  const grid = useRef(undefined);
  const pin_wrap = useRef(undefined);
  const pin = useRef(undefined);
  const [gridN, setGridN] = useState(38)
  const crtDisableTimeout = useRef(undefined);
  const [obstructive, setObstructive] = useState(0)
  const [lowControl, setLowControl] = useState(0)
  const [conductive, setConductive] = useState(0)
  const [highControl, setHighControl] = useState(0)


  const [frameTimeStamp, setFrameTimeStamp] = useState([])
  const [moodCount, setMoodCount] = useState([])
  const [emotionData, setEmotionData] = useState([])
  const [emotionResult, setEmotionResult] = useState([])
  const [emotionChart, setEmotionChart] = useState([])

  const [engangmentData, setEngangmentData] = useState([])
  const [engangmentResult, setEngangmentResult] = useState([])
  const [engangmentChart, setEngangmentChart] = useState([])

  const [topTenData, setTopTenData] = useState([])
  const [topTenResult, setTopTenResult] = useState([])
  const summaryEmotion = () => {

    const arr = emotionData?.reduce((acc, obj) => {
      const key = obj?.name;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += obj?.value;
      return acc;
    }, {});

    let sum = Object.keys(arr).reduce((s, k) => s += arr[k], 0);
    let result = Object.keys(arr).map(k => {
      return {
        name: k,
        value: parseInt(arr[k] / sum * 100)
      }
    });

    setEmotionResult([...emotionResult, ...result])



    let output = emotionResult?.reduce(function (o, cur) {
      let occurs = o.reduce(function (n, item, i) {
        return (item.name === cur.name) ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].value = o[occurs].value.concat(cur.value);

      } else {
        let obj = {
          name: cur.name,
          value: [cur.value]
        };
        o = o.concat([obj]);
      }

      return o;
    }, []);
    return output

  }


  const summaryEngangment = () => {

    const arr = engangmentData?.reduce((acc, obj) => {
      const key = obj?.name;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += obj?.value;
      return acc;
    }, {});

    let sum = Object.keys(arr).reduce((s, k) => s += arr[k], 0);
    let result = Object.keys(arr).map(k => {
      return {
        name: k,
        value: parseInt(arr[k] / sum * 100)
      }
    });

    setEngangmentResult([...engangmentResult, ...result])



    let output = engangmentResult?.reduce(function (o, cur) {
      let occurs = o.reduce(function (n, item, i) {
        return (item.name === cur.name) ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].value = o[occurs].value.concat(cur.value);

      } else {
        let obj = {
          name: cur.name,
          value: [cur.value]
        };
        o = o.concat([obj]);
      }

      return o;
    }, []);
    return output

  }

  const summaryPolarData = () => {
    let uniqueItems;
    let totalItems;
    let filtering;
    totalItems = moodCount?.length
    uniqueItems = [...new Set(moodCount)]
    filtering = moodCount


    uniqueItems.forEach(currValue => {
      const numItems = filtering?.filter(datax => datax === currValue)
      let val = numItems.length * 100 / totalItems

      if (currValue === 'High Control') {
        setHighControl(val)
      }
      if (currValue === 'Obstructive') {
        setObstructive(val)
      }

      if (currValue === 'Low Control') {
        setLowControl(val)
      }

      if (currValue === 'Conductive') {
        setConductive(val)
      }

    })
    return true

  }

  const summaryTopTen = () => {
    let result = topTenData?.map((v) => {
      return {
        name: v?.name,
        value: v?.value * 100
      }
    })
    const sortedArray = result?.sort((a, b) => b.value - a.value);
    const top10 = sortedArray.slice(0, 10);

    const totalSum = top10.reduce((sum, obj) => sum + obj.value, 0);
    const res = top10.map(obj => ({
      ...obj,
      percentage: (obj.value / totalSum) * 100
    }));
    return res
  }
  const [intervals, setIntervals] = useState(0)
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
      window.addEventListener("CY_FACE_POSITIVITY_RESULT", evt => {
      })

      // window.addEventListener("CY_FACE_POSITIVITY_RESULT", evt => console.log('positivity', evt.detail));

      setTimeout(() => {
        window.addEventListener("CY_EVENT_BARRIER", (event) => {
          let obj = [
            {
              name: 'Angry',
              value: event.detail.face_emotion?.emotion?.Angry,
            },
            {
              name: 'Disgust',
              value: event.detail.face_emotion?.emotion?.Disgust,
            },
            {
              name: 'Fear',
              value: event.detail.face_emotion?.emotion?.Fear,
            },
            {
              name: 'Happy',
              value: event.detail.face_emotion?.emotion?.Happy,
            },
            {
              name: 'Surprise',
              value: event.detail.face_emotion?.emotion?.Surprise,
            },
            {
              name: 'Sad',
              value: event.detail.face_emotion?.emotion?.Sad,
            },
            {
              name: 'Neutral',
              value: event.detail.face_emotion?.emotion?.Neutral,
            }
          ]

          let obj2 = [
            {
              name: 'attention',
              value: event.detail.face_attention.attention
            },
            {
              name: 'positivity',
              value: event.detail.face_positivity.positivity
            },
            {
              name: 'valence',
              value: event.detail.face_arousal_valence?.valence < 0 ? event.detail.face_arousal_valence.valence + 1 : 0
            }
          ]

          let objx = event?.detail?.face_arousal_valence?.affects38
          let xx = Object.entries(objx).map(([key, value]) => ({ name: key, value: value }))
          setTopTenData(xx)
          setFrameTimeStamp([...frameTimeStamp, event.detail.camera.frameTimestamp])
          setEmotionData(emotionData.concat(obj))
          setEngangmentData(engangmentData.concat(obj2))
          setEmotionChart(summaryEmotion())
          setEngangmentChart(summaryEngangment())
          setTopTenResult(summaryTopTen())
          if (emotionResult?.length > 0) {
            setIntervals(intervals + 1)
          }
        })
      }, 1000)
      window.addEventListener("resize", fn2);
    }


    function fn(evt) {

      let quadrant = evt.detail.output.quadrant;
      // const total = calcObj(evt.detail.output.affects98)

      setMoodCount([...moodCount, quadrant])
      summaryPolarData()
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

  }, [grid, pin, pin_wrap, moodCount]);


  const dataPolar = {
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

  const optionsPolar = {
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
      }
    }

  }

  // const generateZero = (val, array) => {
  //   let arr = []
  //   for (let i = 0; i < val; i++) {
  //     arr.push(0)
  //   }
  //  const res = arr.concat
  // }

  const generateNewTimestamp = (arr, maxLength = 9) => {
    if (arr.length > maxLength + 1) {
      return arr?.map((v, key) => { return key + 1 }).slice(arr?.length - maxLength, arr?.length)
    } else {
      let res = []
      for (let i = 1; i <= intervals; i++) {
        res.push(i)
      }
      return res
    }
  }

  const getDataEmotion = (key) => {
    let x = emotionChart?.filter((v) => {
      return v.name === key
    }).map((v) => {
      return v?.value
    })
    return x?.length > 0 ? x[0] : []
  }

  const getDataEngangment = (key) => {
    let x = engangmentChart?.filter((v) => {
      return v.name === key
    }).map((v) => {
      return v?.value
    })
    return x?.length > 0 ? x[0] : []
  }


  const dataEmotionOT = {
    labels: generateNewTimestamp(frameTimeStamp),
    datasets: [
      {
        label: 'Angry',
        data: getDataEmotion('Angry'),
        borderColor: 'rgb(168, 54, 50)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Disgust',
        data: getDataEmotion('Disgust'),
        borderColor: 'rgb(76, 168, 50)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Fear',
        data: getDataEmotion('Fear'),
        borderColor: 'rgb(147, 41, 166)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Happy',
        data: getDataEmotion('Happy'),
        borderColor: 'rgb(189, 191, 31)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Sad',
        data: getDataEmotion('Sad'),
        borderColor: 'rgb(40, 143, 191)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Surprise',
        data: getDataEmotion('Surprise'),
        borderColor: 'rgb(224, 132, 160)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Neutral',
        data: getDataEmotion('Neutral'),
        borderColor: 'rgb(81, 87, 89)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
    ],
  };



  const dataEngagment = {
    labels: generateNewTimestamp(frameTimeStamp),
    datasets: [
      {
        label: 'Attention',
        data: getDataEngangment('attention'),
        borderColor: 'rgb(48, 136, 156)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Valence',
        data: getDataEngangment('valence'),
        borderColor: 'rgb(156, 111, 48)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },
      {
        label: 'Positivy',
        data: getDataEngangment('positivity'),
        borderColor: 'rgb(76, 168, 50)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        spanGaps: false,
      },

    ],
  };

  const optionsEmotion = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
      },
    },
    responsive: true,

    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    }
  }
  const optionsEngangment = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
      },
    },
    responsive: true,

    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },

    }
  }
  let predictedRef = useRef(null)
  const generatePDF = async () => {

    const canvas = await html2canvas(predictedRef.current, {
      scale: 1.1,
      dpi: 320,
    });

    let imgWidth = 250;
    let imgHeight = canvas.height * imgWidth / canvas.width;
    const image = canvas.toDataURL("image/jpeg");
    const pdf = new jsPDF('p', 'mm', [250, 800]);
    await pdf.addImage(image, 'JPEG', 0, 0, imgWidth, imgHeight);
    await pdf.save(`Mood Details.pdf`);

  }





  return (
    <>

      <p style={{ fontSize: "20px" }}>Mood Component:</p>
      <div style={{ position: "relative", height: "550px", width: "100%" }}>
        <div className="wrapper" id="grid">
          {(gridN === 38) && <img alt="" src="baseGraph.png" style={{ width: "100%", height: "100%" }} />}
          {(gridN === 98) && <img alt="" src="advancedGraph.png" style={{ width: "100%", height: "100%" }} />}
          <div className="pin_wrap">
            <div className="pin"></div>
          </div>
        </div>
      </div>
      <section style={{ width: '100%' }} ref={predictedRef}>
        <div style={{ width: '100%', marginBottom: 30 }}>
          <h2 style={{ color: '#333' }}>Quadrant Polar</h2>
          <PolarArea type='polarArea'
            options={optionsPolar} data={dataPolar} />
        </div>
        <div style={{ width: '100%', marginBottom: 30 }}>
          <h2 style={{ color: '#333' }}>Emotion Overtime</h2>
          <Line options={optionsEmotion} data={dataEmotionOT} />
        </div>
        <div style={{ width: '100%', marginBottom: 30 }}>
          <h2 style={{ color: '#333' }}>Emotion Engangment</h2>
          <Line options={optionsEngangment} data={dataEngagment} />
        </div>
        <div>
          <h2 style={{ color: '#333' }}>Top 10</h2>
          {
            topTenResult?.map((v) => {
              return (
                <>
                  <div className="row-info">
                    <div className="label-info">
                      {v?.name}
                    </div>
                    <div className="detail-info">
                      {parseFloat(v?.value).toFixed(2)} %
                    </div>
                  </div>
                </>
              )
            })
          }
        </div>
      </section>

      {/* <div>
        <button onClick={() => { setGridN(38) }} disabled={gridN === 38}>38 Affects</button>
        <button onClick={() => { setGridN(98) }} disabled={gridN === 98}>98 Affects</button>
      </div> */}
      <div>
        <Button onClick={() => {
          generatePDF()
        }} variant="primary">Export</Button>
      </div>
    </>
  );
};

export default MoodComponent;
