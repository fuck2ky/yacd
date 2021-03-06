import React from 'react';
import prettyBytes from '../misc/pretty-bytes';

import { connect } from './StateProvider';
import { getClashAPIConfig } from '../store/app';
import { fetchData } from '../api/traffic';
import * as connAPI from '../api/connections';

import s0 from './TrafficNow.module.css';

const { useState, useEffect, useCallback } = React;

const mapState = s => ({
  apiConfig: getClashAPIConfig(s)
});
export default connect(mapState)(TrafficNow);

function TrafficNow({ apiConfig }) {
  const { upStr, downStr } = useSpeed(apiConfig);
  const { upTotal, dlTotal, connNumber } = useConnection(apiConfig);
  return (
    <div className={s0.TrafficNow}>
      <div className="sec">
        <div>Upload</div>
        <div>{upStr}</div>
      </div>
      <div className="sec">
        <div>Download</div>
        <div>{downStr}</div>
      </div>
      <div className="sec">
        <div>Upload Total</div>
        <div>{upTotal}</div>
      </div>
      <div className="sec">
        <div>Download Total</div>
        <div>{dlTotal}</div>
      </div>
      <div className="sec">
        <div>Active Connections</div>
        <div>{connNumber}</div>
      </div>
    </div>
  );
}

function useSpeed(apiConfig) {
  const [speed, setSpeed] = useState({ upStr: '0 B/s', downStr: '0 B/s' });
  useEffect(() => {
    return fetchData(apiConfig).subscribe(o =>
      setSpeed({
        upStr: prettyBytes(o.up) + '/s',
        downStr: prettyBytes(o.down) + '/s'
      })
    );
  }, [apiConfig]);
  return speed;
}

function useConnection(apiConfig) {
  const [state, setState] = useState({
    upTotal: '0 B',
    dlTotal: '0 B',
    connNumber: 0
  });
  const read = useCallback(
    ({ downloadTotal, uploadTotal, connections }) => {
      setState({
        upTotal: prettyBytes(uploadTotal),
        dlTotal: prettyBytes(downloadTotal),
        connNumber: connections.length
      });
    },
    [setState]
  );
  useEffect(() => {
    return connAPI.fetchData(apiConfig, read);
  }, [apiConfig, read]);
  return state;
}
