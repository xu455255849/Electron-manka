/**
 * Created by xushaoping on 17/9/12.
 */

import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export default new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/data.db')
})