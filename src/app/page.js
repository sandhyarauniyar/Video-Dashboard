"use client"  
import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

const Page = () => {
  const [usageData, setUsageData] = useState(null);
  const [filterDuration, setFilterDuration] = useState('7');
  const streamingChartRef = useRef(null);
  const transcodingChartRef = useRef(null);
  const storageChartRef = useRef(null);

  useEffect(() => {
    // fetching data from api made in /usageData.js
    fetch('/api/usageData')
      .then((response) => response.json())
      .then((data) => {
        setUsageData(data);
      });
  }, []);

  // filter function to filter the data as per duration
  // NO DATA WILL BE SHOWN IN FLITERING AS THE DATA IS OLDER THAN 30 DAYS, DOESN'T MATCH THE REQUIREMENTS
  const filterData = (data, duration) => {
    const currentTime = Math.floor(Date.now() / 1000); 
    let durationInSeconds;
    if (duration === '7') {
      durationInSeconds = 7 * 24 * 60 * 60;
    } else if (duration === '14') {
      durationInSeconds = 14 * 24 * 60 * 60;
    } else if (duration === '30') {
      durationInSeconds = 30 * 24 * 60 * 60;
    } else {
      durationInSeconds = 7 * 24 * 60 * 60;
    }

    const startTime = currentTime - durationInSeconds;

    const filtered = {
      bandwidth_consumption: data.bandwidth_consumption.filter((entry) => entry.timestamp >= startTime),
      asset_duration: data.asset_duration.filter((entry) => entry.timestamp >= startTime),
      storage_unit: data.storage_unit.filter((entry) => entry.timestamp >= startTime),
      top_assets: data.top_assets,
    };

    setUsageData(filtered);
    setFilterDuration(duration);
  };

  useEffect(() => {
    if (usageData) {
      renderCharts();
    }
  }, [usageData]);

  // Not taking these as state because currently not expecting any change in this data

  const totalStreamingUsage = usageData?.bandwidth_consumption.reduce((total, entry) => total + entry.units, 0);
  const totalTranscodingUsage = usageData?.asset_duration.reduce((total, entry) => total + entry.units, 0);
  const totalStorageUsage = usageData?.storage_unit.reduce((total, entry) => total + entry.units, 0);


  const formatDuration = (durationInSeconds) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);

    // Ensure hours and minutes are displayed in two digits if less than 10
    let formattedHours = hours < 10 ? `0${hours}` : hours;
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    if(!formattedHours){
      formattedHours = "00";
    }
    if(!formattedMinutes){
      formattedMinutes = "00";
    }
    return `${formattedHours} Hr ${formattedMinutes} Min`;
  };

  const formattedTotalStreamingUsage = formatDuration(totalStreamingUsage);
  const formattedTotalTranscodingUsage = formatDuration(totalTranscodingUsage);
  const formattedTotalStorageUsage = formatDuration(totalStorageUsage);


  const renderCharts = () => {
    const streamingUsageData = usageData.bandwidth_consumption.map((entry, index) => entry.units);
    const transcodingUsageData = usageData.asset_duration.map((entry, index) => entry.units);
    const storageUsageData = usageData.storage_unit.map((entry, index) => entry.units);

    const numDataPoints = usageData.bandwidth_consumption.length;
    const indexes = Array.from({ length: numDataPoints }, (_, i) => i + 1);

    if (streamingChartRef.current) {
      streamingChartRef.current.destroy();
    }
    if (transcodingChartRef.current) {
      transcodingChartRef.current.destroy();
    }
    if (storageChartRef.current) {
      storageChartRef.current.destroy();
    }

    streamingChartRef.current = new Chart('streamingChart', {
      type: 'line',
      data: {
        labels: indexes,
        datasets: [
          {
            label: 'Streaming Usage (sec)',
            data: streamingUsageData,
            borderColor: '#8e7dfd', 
          backgroundColor: '#8e7dfd', 
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            ticks: {
              stepSize: 1, 
              callback: function (value, index, values) {
                if (index === 0) {
                  return '';
                }
                return value;
              },
            },
          },
          y: {
            ticks: {
              callback: function (value, index, values) {
                if (value >= 1000) {
                  return (value / 1000) + 'k';
                }
                return value;
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false, 
          },
        },
      },
    });

    transcodingChartRef.current = new Chart('transcodingChart', {
      type: 'line',
      data: {
        labels: indexes,
        datasets: [
          {
            label: 'Transcoding Usage (sec)',
            data: transcodingUsageData,
            borderColor: '#8e7dfd', 
          backgroundColor: '#8e7dfd', 
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            ticks: {
              stepSize: 1, 
              callback: function (value, index, values) {
                if (index === 0) {
                  return '';
                }
                return value;
              },
            },
          },
          y: {
            ticks: {
              callback: function (value, index, values) {
                if (value >= 1000) {
                  return (value / 1000) + 'k';
                }
                return value;
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false, 
          },
        },
      },
    });

    storageChartRef.current = new Chart('storageChart', {
      type: 'bar',
      data: {
        labels: indexes,
        datasets: [
          {
            label: 'Storage Usage (sec)',
            data: storageUsageData,
            borderColor: '#8e7dfd', 
            backgroundColor: '#8e7dfd',
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            ticks: {
              stepSize: 1, // Set the step size for the x-axis labels to 1
              callback: function (value, index, values) {
                // Hide the label for the first value (index 0)
                if (index === 0) {
                  return '';
                }
                return value;
              },
            },
          },
          y: {
            ticks: {
              // Use a callback to format the y-axis tick labels
              callback: function (value, index, values) {
                if (value >= 1000) {
                  return (value / 1000) + 'k';
                }
                return value;
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false, 
          },
        },
      },
    });
  };


  if (usageData && usageData.top_assets) {

    // considering top_assets and asset duration are in the same order, ideally there should be assetId associated to each asset duration
    
    return (
      <div className='dashboard'>

        <div className='dashboard__topbar'>
          <div className='topbar__usage'>
            <div className='heading-container'>
              <div className='heading'>STREAMING USAGE</div>
              <img src = "/wifi-signal.png"/>
            </div>
            <div className='usage'>{formattedTotalStreamingUsage}</div>
          </div>

          <div className='topbar__usage'>
            <div className='heading-container'>
              <div className='heading'>STORAGE USAGE</div>
              <img src = "/database.png"/>
            </div>
            <div className='usage'>{formattedTotalStorageUsage}</div>
          </div>

          <div className='topbar__usage transcoder'>
            <div className='heading-container'>
              <div className='heading'>TRANSCODING USAGE</div>
              <img src = "/transistor.png"/>
            </div>
            <div className='usage'>{formattedTotalTranscodingUsage}</div>
          </div>
        </div>

        <div className='dashboard__filter'>
          <span className='filter-heading'>Filter By</span>
          <button className="filter-btn" onClick={() => filterData(usageData, '7')}>Last 7 Days</button>
          <button  className="filter-btn" onClick={() => filterData(usageData, '14')}>Last 14 Days</button>
          <button  className="filter-btn" onClick={() => filterData(usageData, '30')}>Last 30 Days</button>
      </div>

      <div className='charts-container'>
          <div className='chart'>
            <div className='title'>Streaming Usage</div>
            <canvas id="streamingChart" width="400" height="200"></canvas>
          </div>

          <div className='chart'>
            <div className='title'>Transcoding Usage</div>
            <canvas id="transcodingChart" width="400" height="200"></canvas>
          </div>

          <div className='chart'>
            <div className='title'>Storage Usage</div>
            <canvas id="storageChart" width="400" height="200"></canvas>
          </div>

          <div className='chart dashboard__table-container'>
            <div className='title-container'>
                <div className='table-title'>Top Assets</div>
                <div className='view-all'>View All</div>
            </div>
            <table className='dashboard__table'>
              <thead>
                <tr>
                  <th>ASSET ID</th>
                  <th>COLLECTION NAME</th>
                  <th>STREAM DURATION</th>
                </tr>
              </thead>
              <tbody>
                {usageData.top_assets.map((asset,index) => (
                  <tr key={asset.asset_id}>
                    <td>{asset.asset_id}</td>
                    <td><button className='dashboard__table__button'>{asset.collection_name}</button></td>
                    <td>{formatDuration(usageData?.asset_duration[index]?.units)}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }

};

export default Page;
