import xlsxPopulate, { RichText } from "xlsx-populate";
import { BASE64_HEADER, BASE64_HEADER_All, CHECK_INJECTION_PATTERN, COOKIE, SIGN, ANSWER, INFORMATION, DATE } from "./const";
import { I18n, API } from 'aws-amplify'
export default{
  computed: {
    answerStatusItems() {
      return [
        {
          text: this.$t('answer.status.status1'),
          value: ANSWER.STATUS.NOT_ENTERD,
        },
        {
          text: this.$t('answer.status.status2'),
          value: ANSWER.STATUS.TEMPORARY_SAVED,
        },
        {
          text: this.$t('answer.status.status3'),
          value: ANSWER.STATUS.END,
        }
      ]
    },
    getAnswerStatus() {
      return (item) => {
        const status = this.answerStatusItems.filter(e=>e.value==item)
        if( 0 < status.length ) {
          return status[0].text
        } else {
          return ''
        }
      }
    },
    getAnswerStatusColor() {
      return (item) => {
        if (item == this.refConst.ANSWER.STATUS.NOT_ENTERD) {
          return 'red--text'
        }
        else if (item == this.refConst.ANSWER.STATUS.END) {
          return 'green--text'
        }
        else {
          return ''
        }
      }
    },
    signStatusItems() {
      return [
        {
          name: this.$t('sign.status.status1'),
          val: SIGN.STATUS.NOT_ENTERD,
        },
        {
          name: this.$t('sign.status.status2'),
          val: SIGN.STATUS.TEMPORARY_SAVED,
        },
        {
          name: this.$t('sign.status.status3'),
          val: SIGN.STATUS.SAVED,
        }
      ]
    },
    getSignStatus() {
      return (item) => {
        const status = this.signStatusItems.filter(e=>e.val==item)
        if( 0 < status.length ) {
          return status[0].name
        } else {
          return ''
        }
      }
    },
    getSignStatusColor() {
      return (item) => {
        if (item == this.refConst.SIGN.STATUS.NOT_ENTERD) {
          return 'red--text'
        }
        else if (item == this.refConst.SIGN.STATUS.SAVED) {
          return 'green--text'
        }
        else {
          return ''
        }
      }
    },
    informationStatusItems() {
      return [
        {
          name: this.$t('information.status.status1'),
          val: INFORMATION.STATUS.PRIVATE,
        },
        {
          name: this.$t('information.status.status2'),
          val: INFORMATION.STATUS.PUBLIC,
        },
        {
          name: this.$t('information.status.status3'),
          val: INFORMATION.STATUS.END,
        }
      ]
    },
    getInformationStatus() {
      return (item) => {
        const status = this.informationStatusItems.filter(e=>e.val===item)
        if( 0 < status.length ) {
          return status[0].name
        } else {
          return ''
        }
      }
    },
    getInformationStatusColor() {
      return (item) => {
        if (item == this.informationStatusItems[0].val) {
          return 'red--text'
        }
        else if (item == this.informationStatusItems[1].val) {
          return 'green--text'
        }
        else {
          return ''
        }
      }
    },
    userStatusItems() {
      return [
        { state: this.$t('user.status.status1'), abbr: "CONFIRMED" },
        { state: this.$t('user.status.status2'), abbr: "RESET_REQUIRED" },
        { state: this.$t('user.status.status3'), abbr: "FORCE_CHANGE_PASSWORD" },
        { state: this.$t('user.status.status4'), abbr: "UNKNOWN" },
        { state: this.$t('user.status.status5'), abbr: "UNCONFIRMED" },
        { state: this.$t('user.status.status6'), abbr: "COMPROMISED" },
        { state: this.$t('user.status.status6'), abbr: "ARCHIVED" }
      ]
    },            
    getUserStatus() {
        return (status) => {
            let result = this.userStatusItems[0].state
            this.userStatusItems.forEach (function(item){
                if (item.abbr == status) {
                    result = item.state
                }
            })
            return result
        }
    },
    getFormatDate() {
        return (date) => {
            return this.$moment(date).format(DATE.TIME_FORMAT)
        }
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    currentCompanyCode() {
      return this.$store.getters.getCompanyCode
    },
    isJp() {
      return this.$i18n.locale === 'ja'
    },
  },
  methods: {
    csvDownload: function (data, csvHeaders, fileName, transpose = false, replaceHeaders = undefined) {
      let csv = [];
      if (replaceHeaders) {
        replaceHeaders.forEach((header, idx) => {
          csv.push([(idx < replaceHeaders.length - 1 ? "" : "#")].concat(header.map((_) => `"${_}"`)));
        })
      } else {
        csv.push(["#"].concat(csvHeaders.map((_) => `"${_.text}"`)));
      }

      // csvインジェクション対策
      data.forEach((user, index) => {
        const line = [];
        index++

        line.push(index)
        csvHeaders.forEach((header) => {
          let v = user[header.value];

          if (typeof v === "number") {
            v = String(v)
          }

          if (CHECK_INJECTION_PATTERN.test(v)) {
            v = `'${v}`
          }

          line.push(`"${v ? v.replace(/"/g, '""') : ""}"`);
        });
        csv.push(line);
      });

      if (transpose) {
        csv = csv[0].map((_, c) => csv.map(r => r[c]));
      }

      let blob = new Blob(["\ufeff" + csv.map(_ => _.join(',')).join('\n')], { type: "text/csv" });
      let link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      link.download = fileName;
      link.click();
    },
    
    /**
     * EXCELバイナリのpcs-configシートのkey項目を取得する
     * - EXCELの名前定義で参照されている部分(#始まり)は参照先のカラム値を取得する
     * - ##の場合は値を配列で返す
     * @param {ArrayBuffer} xlsxBuffer - EXCELバイナリ
     * @param {string} key - pcs-configシートのkey
     * @returns key項目の値
     */
    async getExcelData(xlsxBuffer, key){
      const wb = await xlsxPopulate.fromDataAsync(xlsxBuffer);
      const conf = wb.sheet("pcs-config");
      if (conf == null) {
        throw new Error("pcs-config not found")
      }
      const keyContent = conf.find(key).filter(e=>e.columnNumber() === 1)
       if (keyContent === null || 0 === keyContent.length) {
        throw new Error("keyContent not found")
       }
      const target = keyContent[0].row();
      return _convertRichTextToText(_mapRefdata(wb, JSON.parse(target.cell(2).value())));
    },
    
    /**
     * EXCELバイナリのpcs-configシートのkey項目を取得する
     * - EXCELの名前定義で参照されている部分(#始まり)は参照先のカラム値を取得する
     * - ##の場合は値を配列で返す
     * @param {ArrayBuffer} xlsxBuffer - EXCELバイナリ
     * @param {string} key - pcs-configシートのkey
     * @returns key項目の値
     */
    async getExcelDataForCsv(xlsxBuffer, key){
      const wb = await xlsxPopulate.fromDataAsync(xlsxBuffer);
      const conf = wb.sheet("pcs-config");
      if (conf == null) {
        throw new Error("pcs-config not found")
      }
      const keyContent = conf.find(key).filter(e=>e.columnNumber() === 1)
       if (keyContent === null || 0 === keyContent.length) {
        throw new Error("keyContent not found")
       }
      const target = keyContent[0].row();
      return _convertRichTextToText(_mapCsvdata(wb, JSON.parse(target.cell(2).value())));
    },
    
    /**
     * EXCELバイナリのpcs-configシートからセル範囲を指定して値を文字列に変換して取得する
     * @param {ArrayBuffer} xlsxBuffer - EXCELバイナリ
     * @returns 指定セル範囲の値の文字列
     */
    async getRangeExcelData(xlsxBuffer) {
      try {
        const wb = await xlsxPopulate.fromDataAsync(xlsxBuffer);
        const conf = wb.sheet("pcs-config");
        if (conf === undefined) {
          return ""
        }
        // セルB1〜B8の範囲で取得
        let content = conf.range("B1:B8").value().filter(e=>e[0] !== undefined)
        
        if (content === undefined || 0 === content.length) {
          return ""
        }
        return JSON.stringify(content)
      } catch (e){
        return ""
      }
    },

    // エクセルの全シートの入力範囲を取得
    async getMaxRangeOfAllSheets(xlsxBuffer) {
      const wb = await xlsxPopulate.fromDataAsync(xlsxBuffer);
      const ranges = [];
      wb.sheets().forEach(sheet=>{
        const range = sheet.usedRange();
        if (range) {
          ranges.push({ numRow: range._maxRowNumber, numColumn: range._maxColumnNumber})
        } else {
          ranges.push({ numRow: 0, numColumn: 0})
        }
      })
      return ranges
    },

    // 全名前定義を取得
    async getAllDefinedNames(xlsxBuffer) {
      const wb = await xlsxPopulate.fromDataAsync(xlsxBuffer);
      return wb._node.children.filter(e=>e.name==='definedNames')[0].children.map(e=>[e.attributes.name, ...e.children].join(":")).filter( v => !v.startsWith("_xlnm."))
    },

    // バイナリ文字列作成
    arrayBufferToBinaryString(arrayBuffer) {
      let binaryString = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      return binaryString
    },
    // ファイルのダウンロード
    async dispatchDownload(blob, filename) {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename
      link.click();
    },

    // base64にデコード
    async base64DecodeAsBlob(text) {
      return fetch(BASE64_HEADER + text).then(response => response.blob());
    },
    async base64DecodeAsBlobAll(text) {
      return fetch(BASE64_HEADER_All + text).then(response => response.blob());
    },
    stringFormat (str, ...args) {
      for (const [i, arg] of args.entries()) {
        const regExp = new RegExp(`\\{${i}\\}`, 'g')
        str = str.replace(regExp, arg)
      }
      return str
    },
    changeLang(lang){
      I18n.setLanguage(lang)
      this.$i18n.locale = lang
      this.$cookies.set(COOKIE.LANG.key, lang, COOKIE.LANG.expireTimes, COOKIE.LANG.path)
      const router = this.$router
      const title = router.app.$t(`menu.${router.currentRoute.name}`)
      document.title = `${title}|${router.app.$t('pageTitle')}` || router.app.$t('pageTitle')
    },
    
    async sleep(time) {
      return new Promise( resolve => setTimeout(resolve, time) );
    },

    createParam(params){
      if( this.isAdmin ) {
        return params
      }
      const p = params ? params : {}
      if(p.queryStringParameters) {
        p.queryStringParameters.selectedCompanyCode = this.$store.getters.getSelectedCompanyCode
      } else {
        p['queryStringParameters'] = {
          selectedCompanyCode: this.$store.getters.getSelectedCompanyCode
        }
      }
      return p
    },

    apiGet(name, path, params){
      return API.get(name, path, this.createParam(params))
    },

    apiPost(name, path, params){
      return API.post(name, path, this.createParam(params))
    },

    apiPut(name, path, params){
      return API.put(name, path, this.createParam(params))
    },

    apiPatch(name, path, params){
      return API.patch(name, path, this.createParam(params))
    },

    apiDel(name, path, params){
      return API.del(name, path, this.createParam(params))
    },
  },
}

// private
function _mapRefdata(wb, value) {
  if (value instanceof Array) {
    value.forEach((d, i) => {
      value[i] = _mapRefdata(wb, d);
    });
    return value;
  }
  Object.keys(value).map((key) => {
    const val = value[key];
    if (val instanceof Array || val instanceof Object) {
      value[key] = _mapRefdata(wb, val);
    } else {
      if (typeof val === "string" && val.startsWith("#")) {
        value[key] = _getDefinedName(wb, val.replace(/^#+/g, ''), val.startsWith("##"));
      }
    }
  });
  return value;
}

function _mapCsvdata(wb, keys) {
  let result = [];
  keys.forEach((key) => {
    const _data = key.startsWith("#") ? _getDefinedName(wb, key.replace(/^#+/g, "")) : key ;
    if (_data instanceof Array) {
      if (key.startsWith("##")) {
        result = result.concat(..._data);
      } else {
        _data.forEach((_) => result.push(_));
      }
    } else {
      result.push(_data);
    }
  });

  let maxHeaderRow = 0;
  result.forEach((row) => {
    if (row instanceof Array && row.length > maxHeaderRow) maxHeaderRow = row.length;
  });
  result = result.map((row) => {
    let _row = row;
    if (!(row instanceof Array)) {
      _row = [row];
    }
    return Array.apply(null, new Array(maxHeaderRow))
      .map(String.prototype.valueOf, "")
      .concat(_row.map((_) => (_ ? _ : "")))
      .slice(-maxHeaderRow);
  });
  result = result[0].map((_, idx) => result.map((r) => r[idx]));
  if (1 === result.length) {
    return result[0];
  }
  return result;
}

function _getDefinedName(workbook, name, isForceArray) {
  const _result = workbook.definedName(name).value();
  if (_result instanceof Array) {
    for( let j=0 ; j < _result.length ; j++ ) {
      const cols = _result[j];
      for (let i = 0; i < cols.length; i++) {
        if (typeof cols[i] === "object") {
          if( cols[i].error ) 
            throw new Error(cols[i].error());
          cols[i] = cols[i].text();
        }
      }
      if( cols.length === 1 ) {
        _result[j] = cols[0];
      }
    }
  } else {
    if (typeof _result === "object" && _result.error ) {
      throw new Error(_result.error());
    }
    if( isForceArray ) {
      return [_result]
    }
  }
  return _result;
}

function _convertRichTextToText(obj) {
  if( Array.isArray(obj)) {
    return obj.map(e=>_convertRichTextToText(e))
  }
  if( classOf(obj)==='hash' ) {
    Object.keys(obj).forEach(k=>obj[k]=_convertRichTextToText(obj[k]))
    return obj;
  }
  if( obj instanceof RichText) {
    return obj.text()
  }
  return obj
}
function classOf(obj){
  if((typeof obj)=="object"){
      if(obj.length!=undefined)return "array";
      else{
        for(const t in obj){
          if(obj[t]!=undefined)return "hash";
          else return "object";
        }
      }
  }else return (typeof obj);
}
