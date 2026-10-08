import {Config} from '@remotion/cli/config';
import path from 'node:path';
Config.setRspack(true);
Config.setChromeMode('chrome-for-testing');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.overrideRspackConfig(config=>({...config,resolve:{...config.resolve,alias:{...config.resolve?.alias,react:path.resolve('node_modules/react'),'react-dom':path.resolve('node_modules/react-dom')}}}));
