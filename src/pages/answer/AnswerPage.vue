<template>
    <div class="px-10" v-if="initializeDone">
      <h1 class="text-left" v-if="isAdmin">{{ answerItems[page].companyName }}</h1>
      <h2 class="text-center" v-if="title(page) != ''">
        <span class="question-title">{{ title(page) }}</span>
      </h2>
      <div class="text-right">
        <v-chip
          label
        >
        {{$t('common.implNo')}}:{{ answerItems[page].answerKey.implNo }}
        {{$t('common.revisionNo')}}:{{ answerItems[page].answerKey.revisionNo }}
        </v-chip>
        <!-- リビジョン名 -->
        <p style="font-weight: bold;">{{ isJp ? answerItems[page].revisionTitle : answerItems[page].revisionTitleEn }}</p>
      </div>
      <div style="margin-bottom:5px" class="text-right" v-if="isAdmin" >
        <label>{{$t('common.inputRange')}}:{{ answerItems[page].startDate }} ~ {{ answerItems[page].endDate }}</label>
      </div>
      <div class="text-right" v-if="!isSummaryExists && isEditablePage && isAdmin">
        <PostButton
          :buttonName="$t('answer.actions.inputDownload')"
          color="primary"
          @openModal="getFormatAnswer()"
        />
      </div>

      <div style="height:50px" v-if="isEditablePage && !isAdmin && !isSummaryExists"></div>
      <div v-if="isPaging">
        <v-btn
          icon
          @click="jumpFirst"
          :class="invisiblePrevButton"
        >
          <v-icon>mdi-page-first</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="prev"
          :class="invisiblePrevButton"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <span>{{ answerItems[page].answerKey.historyNo }}</span>
        <v-btn
          icon
          @click="next"
          :class="invisibleNextButton"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="jumpLast"
          :class="invisibleNextButton"
        >
          <v-icon>mdi-page-last</v-icon>
        </v-btn>
      </div>

      <!--  未回答、回答済みの切り替え -->
      <div>
        <div class="unanswered" v-if="isEditablePage && !isAdmin && !isSummaryExists">
          <div class="frame">
            <p class="text-left">{{$t('answer.guide.line1')}}</p>
            <p class="text-left">{{$t('answer.guide.line1Comment')}}</p>
            <div class="text-right">
              <PostButton
                :buttonName="$t('answer.actions.inputDownload')"
                color="primary"
                @openModal="getFormatAnswer()"
              />
            </div>
          </div>
          <div style="font-weight:bold; font-size:200%;">  ↓  </div>
          <div class="frame">
            <p class="text-left">{{$t('answer.guide.line2')}}</p>
            <div v-if="!isAdmin && !isSummaryExists && isHistoryExists">
              <p class="text-left">{{$t('answer.guide.line2Comment')}}</p>
              <div class="text-right">
                <PostButton
                  :buttonName="$t('answer.actions.preDownload')"
                  color="primary"
                  @openModal="openConfirmModal('download')"
                />
              </div>
            </div>
          </div>
          <div style="font-weight:bold; font-size:200%;">  ↓  </div>
          <div class="frame">
            <p class="text-left">{{$t('answer.guide.line3')}}</p>
            <p class="text-left">{{$t('answer.guide.line3Comment')}}</p>
            <div class="drop_area"
                     @dragover.prevent
                     @drop.prevent="dropFile"
                style="display: flex; vertical-align: middle;">
                  <span style="margin-right: 10px">{{$t('answer.guide.ddComent')}}</span>
                  <div class="text-right">
                    <label for="file_select">
                      <div class="btn">
                        <input type="file" v-on:change="fileChange" accept="text/*,.xlsx" style="display:none" id="file_select"/>
                        <p>{{$t('answer.actions.selectFile')}}</p>
                      </div>
                    </label>
                  </div>
            </div>
          </div>
        </div>
        <div class="answered" v-else>
          <div v-if="isEndStatus" class="text-right mt-2">
            <v-chip
              label
            >
            {{$t('answer.answeredDate')}}:{{ answerItems[page].answeredAt ? answerItems[page].answeredAt : answerItems[page].lastUpdateDate }}
            </v-chip>
          </div>
          <div class="error_text" v-if="isError && isEditablePage">{{$t('message.unanswered')}}</div>
          <div class="error_text" v-if="!isSummaryExists && isEditablePage && isAdmin">{{$t('message.noanswer')}}</div>
          <div class="complete_text" v-if="!isError && isEditablePage && !isAdmin && isCanSaveStatus">{{$t('message.guideAnswered')}}</div>
          <v-container class="summary_area" v-if="isSummaryExists" >

            <!-- signs -->
            <div class="summary_sign_col">
              <template v-for="(item, index) in answerSummary.sign">
                <v-text-field readonly
                  class="d-sm-inline-flex summary_sign"
                  v-bind:key="`c${index}`"
                  disabled
                  :label="item.label" :value="checkSign(index) ? item.value:' '"
                  v-bind:class="{'no_sign': !checkSign(index)}"
                  hide-details="auto"></v-text-field>
              </template>
            </div>

            <!-- ヘッダー -->
            <v-row class="mt-3" no-gutters justify="center">
              <v-col cols="2"></v-col>
              <template v-for="(item, index) in answerSummary.header">
                <v-col class="summary_header" :cols="item.cols" v-bind:key="`${index}`"> {{ item.label }} </v-col>
              </template>
            </v-row>
            <!-- サブヘッダー -->
            <v-row no-gutters justify="center">
              <v-col cols="2"></v-col>
              <v-col
                class="summary_header"
                v-for="(item, index) in answerSummary.headerSub"
                v-bind:key="`${index}`" cols="1">
                {{item}}
              </v-col>
            </v-row>
            <!-- 内容 -->
            <v-row 
                no-gutters justify="center"
                v-for="(row, rowNum) in answerSummary.contents"
                v-bind:key="rowNum">
              <v-col class="summary_label" 
                v-bind:class="{
                  'summary_label_total': answerSummary.totalRows.indexOf(rowNum)!==-1,
                  'summary_label_subtotal': answerSummary.subtotalRows.indexOf(rowNum)!==-1
                  }" cols="2">
                <span>{{ row.label }}</span>
              </v-col>
              <v-col class="summary_col"
                v-for="(content, colNum) in row.data"
                v-bind:key="`${rowNum}_${colNum}`"
                v-bind:class="{
                  'no_answer': row.error && answerSummary.errorCols.indexOf(answerSummary.headerSub[colNum])!==-1,
                  'summary_col_total': answerSummary.totalRows.indexOf(rowNum)!==-1,
                  'summary_col_subtotal': answerSummary.subtotalRows.indexOf(rowNum)!==-1
                  }"
                cols="1">
                {{content}}
              </v-col>
            </v-row>
          </v-container>
          <div style="display: flex; justify-content: flex-end; margin-top: 10px; align-items: center;">
            <div class="drop_area"
                 @dragover.prevent
                 @drop.prevent="dropFile"
                 style="display: flex; vertical-align: middle;" v-if="!isAdmin && isCanSaveStatus && isEditablePage">
              <span style="margin-right: 10px">{{$t('answer.guide.ddComent')}}</span>
              <div class="text-right">
                <label for="file_select_2">
                  <div class="btn">
                    <input type="file" v-on:change="fileChange" style="display:none" id="file_select_2"/>
                    <p>{{$t('answer.actions.selectFile')}}</p>
                  </div>
                </label>
              </div>
            </div>
            <div style="margin-left: 10px">
              <div style="display: flex;" v-if="isSavedStatus">
                <PostButton
                  style="margin: 5px; flex: 1"
                  v-bind:buttonName="isEditablePage ? $t('answer.actions.inputedDownload') : $t('answer.actions.download')"
                  color="primary"
                  @openModal="openConfirmModal('download')"
                />
              </div>
              <div style="display: flex;">
                <PostButton
                  v-if="isEditablePage && isAdmin && isEndStatus"
                  style="margin: 5px;flex: 1"
                  :buttonName="$t('answer.actions.reject')"
                  color="primary"
                  @openModal="openConfirmModal('reject')"
                />
                <PostButton
                  v-if="isEditablePage && isAdmin && isSavedStatus"
                  style="margin: 5px;flex: 1"
                  :buttonName="$t('answer.actions.renew')"
                  color="primary"
                  @openModal="openConfirmModal('renew')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <v-row
          align="center"
          justify="space-around"
          class=""
        >
          <div v-if="isAdmin || !isEditablePage || !isSummaryExists || isEndStatus">
            <v-col class="pb-10">
              <ReturnIndexButton
                :path="returnPath"
              />
            </v-col>
          </div>
          <div v-else>
            <div style="display: flex;" v-if="!isAdmin && isCanSaveStatus && isEditablePage">
              <v-btn large depressed color="primary" style="margin: 5px;flex: 1" :to="returnPath">
                  {{$t('common.cancel')}}
              </v-btn>
              <PostButton
                style="margin: 5px;flex: 1"
                :buttonName="$t('common.tempSave')"
                color="primary"
                @openModal="openConfirmModal('save')"
              />
              <PostButton
                style="margin: 5px;flex: 1"
                :buttonName="$t('answer.actions.save')"
                color="inherit"
                :disabled="true"
                v-if="isError"
              />
              <PostButton
                style="margin: 5px;flex: 1"
                :buttonName="$t('answer.actions.save')"
                color="red white--text"
                @openModal="openConfirmModal('done')"
                v-else
              />
            </div>
          </div>
        </v-row>
        <v-dialog v-model="confirmModal" :width="isHtml ? 640: 500">
          <Modal
            @clickClose="closeModal"
            :message="modalMessage"
            :disabled="modalDisabled"
            :isHtml="isHtml"
            @clickSubmit="submitEvent"
          ></Modal>
        </v-dialog>
        <v-dialog v-model="errorModal" :width="isHtml ? 640: 500">
          <Modal
            @clickOk="closeModal"
            :message="modalMessage"
            :disabled="modalDisabled"
            :isHtml="isHtml"
            modalType="ok"
          ></Modal>
        </v-dialog>
        <v-dialog v-model="textModal" width="500">
          <TextModal
            @clickClose="closeModal"
            :message="modalMessage"
            :disabled="modalDisabled"
            @clickSubmit="submitEvent"
          ></TextModal>
        </v-dialog>
      </div>
      <Overlay
        :overlay="overlay"
      />
      <v-snackbar
        v-model="snackbarSucceed"
        color="primary"
        text
        icon
        top
      >
       {{ snackbarMessage }}
       <template v-slot:action="{ attrs }">
         <v-btn color="primary" text v-bind="attrs" @click="snackbarSucceed = false" icon>
           <v-icon>mdi-close</v-icon>
         </v-btn>
       </template>
      </v-snackbar>
      <v-snackbar
        v-model="snackbarFailed"
        color="error"
        text
        icon
        top
      >
      {{ snackbarMessage }}
       <template v-slot:action="{ attrs }">
         <v-btn color="error" text v-bind="attrs" @click="snackbarFailed = false" icon>
           <v-icon>mdi-close</v-icon>
         </v-btn>
       </template>
      </v-snackbar>
    </div>
</template>
<script>
  import Modal from '@/components/modules/Modal'
  import TextModal from '@/components/modules/TextModal'
  import PostButton from '@/components/parts/PostButton'
  import Overlay from '@/components/parts/Overlay'
  import ReturnIndexButton from '@/components/parts/ReturnIndexButton'

  import { API, Hub } from "aws-amplify"
  import { ANSWER, EXCEL_MIME_TYPE } from "@/const.js";

  const apiName = 'PcsAPI'

  export default {
    name: 'QuestionPage',
    components: {
      Modal,
      TextModal,
      PostButton,
      Overlay,
      ReturnIndexButton,
    },
    data() {
      return {
        returnPath: '/answer',
        answerItems: [], // getAnswerで取得したページ情報
        answerSummary: undefined, // 現在のページのアンケート回答のサマリ情報
        formatAnswerString: undefined, // 隠しシートのチェックサム
        formatAnswerRange: undefined, // フォーマットEXCELの最大範囲
        formatDefinedNames: undefined, // フォーマットEXCELの全名前定義
        initializeDone: false, // 初期表示用

        // モーダル用
        confirmModal: false,
        errorModal: false,
        textModal: false,
        modalDisabled: false,
        modalMessage: '',
        modalStatus: undefined,
        isHtml: false,

        // ローディング用
        overlay: false,

        // 通知メッセージ用
        snackbarSucceed: false,
        snackbarFailed: false,
        snackbarMessage: undefined,
        
        // ページャ用
        page: 0,
        allCount: 0,        
      }
    },
    computed: {

      // 前画面からのパラメータgetter
      getImplNo() {
        return this.$route.params.impl_no
      },
      getCompanyCode() {
        return this.$route.params.company_code
      },
      getHistoryNo() {
        return this.$route.params.history_no
      },

      // 状態判定
      isEditablePage() {
        return (0 === this.page );
      },
      isPaging() {
        return 1 < this.allCount;
      },
      isSummaryExists() {
        return this.answerSummary
      },
      // 保存可能状態
      isCanSaveStatus() {
        return (this.checkStatus([ ANSWER.STATUS.NOT_ENTERD, ANSWER.STATUS.TEMPORARY_SAVED]))
      },
      // 保存済み状態
      isSavedStatus() {
        return (this.checkStatus([ ANSWER.STATUS.TEMPORARY_SAVED, ANSWER.STATUS.END]))
      },
      // 入力完了状態
      isEndStatus() {
        return (this.checkStatus([ ANSWER.STATUS.END]))
      },
      isHistoryExists() {
        return this.allCount > 1 
      },
      isError() {
        if( this.answerSummary ) {
          // 署名がある場合のみ署名チェック
          if( this.answerSummary.sign && this.answerSummary.sign.filter(e=>e.value === undefined || e.value === '').length > 0 ) {
            return true;
          }

          // 回答
          return ( this.answerSummary.contents.filter(e=>e.error===true).length > 0 );
        }
        // サマリなしはあり得ないがエラーなし扱い
        return false;
      },
      invisiblePrevButton() {
        return {
          'invisible-btn': this.page + 1 === this.allCount
        }
      },
      invisibleNextButton() {
        return {
          'invisible-btn': this.isEditablePage
        }
      },
      title() {
        return (page) => {
          return this.isJp ? this.answerItems[page].title : this.answerItems[page].titleEn
        }
      },
    },

    // 初期表示処理
    mounted() {
      this.checkUrlParams()
      this.getAnswer(false)
    },

    methods: {
      // URLパラメータチェック
      checkUrlParams() {
        // 実施番号
        if (this.getImplNo === undefined || String(this.getImplNo).trim().length === 0) {
          throw new Error('404')
        }
        
        // 履歴番号
        if (this.getHistoryNo === undefined || String(this.getHistoryNo).trim().length === 0) {
          throw new Error('404')
        }
        
        // 会社コード
        if (this.isAdmin && (this.getCompanyCode === undefined || String(this.getCompanyCode).trim().length === 0)) {
          throw new Error('404')
        }
      },
      
      // 内部状態チェック
      checkSign(index){
        return !( this.answerSummary.sign[index].value === undefined || this.answerSummary.sign[index].value === '' ) 
      },
      checkStatus(statusList) {
        return statusList.filter(s=>s==this.answerItems[this.page].status).length > 0;
      },

      // サマリデータ作成
      makeSummary(param) {
        if(!param || !param.summary) return undefined;
        const data = param.summary;
        if( !data.answer ) {
          // 古いフォーマット（将来的に廃止）
          const headerSub = [...data.header_sub.score[0], ...data.header_sub.content[0]];
          const contents = [...data.content, ...data.total].map(d=>{
                return {
                  label: d.label,
                  data: [...d.score[0], ...d.content[0]],
                  error: data.check_content.filter((e, i)=>e && d.content[0][i] > 0 ).length > 0
                };
            });
          return {
            sign: data.sign,
            header: [
              { label: data.header.score, cols: data.header_sub.score[0].length },
              { label: data.header.content, cols: data.header_sub.content[0].length },
            ],
            headerSub: headerSub,
            contents: contents,
            errorCols: [headerSub[7]],
            subtotalRows: [],
            totalRows: [contents.length-1],
          }
        }
        const skipCols = data.answer.skipCols; // 非表示列

        // 列グルーピング
        const header = [];
        data.answer.groups[0].filter((_, i)=>skipCols.indexOf(i+1) === -1).forEach(e=>{
          if(e) {
            header.push({ label: e, cols: 1})
          } else {
            header[header.length-1].cols++;
          }
        })

        // 行データ
        const contents = data.answer.table.slice(1).map(d=>{
            return {
              label: d[0],
              data: d.filter((_, i)=>skipCols.indexOf(i) === -1).slice(1),
              error: d.filter((_, i)=>data.answer.checkCols.indexOf(i) !== -1).filter(e=>e!==0).length > 0
            };
          });
        return {
          sign: data.sign,
          header: header,
          headerSub: data.answer.table[0].filter((_, i)=>skipCols.indexOf(i) === -1).slice(1),
          contents: contents,
          errorCols: data.answer.errorCols.map(e=>data.answer.table[0][e]), // エラー表示する列
          subtotalRows: data.answer.subtotalRows ? data.answer.subtotalRows.map(e=>e-1) : [], // 小計行
          totalRows: data.answer.totalRows ? data.answer.totalRows.map(e=>e-1) : [contents.length-1], // 合計行
        }
      },

      // ファイルアップロード処理
      async uploadFile(blob) {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        try {
          const answerRange = await this.getMaxRangeOfAllSheets(blob);
          // エクセルシート数チェック
          if (this.formatAnswerRange.length !== answerRange.length) {
            throw new Error("sheets error")
          }
          
          // エクセルの全シートの入力範囲のチェック
          if ( 0 < this.formatAnswerRange.filter( 
            (v, i) => v.numRow !== answerRange[i].numRow || v.numColumn !== answerRange[i].numColumn).length) {
            throw new Error("usedRange error")
          }
          
          // 名前定義のチェック
          const definedNames = await this.getAllDefinedNames(blob)
          if (this.formatDefinedNames.length !== definedNames.length) {
            throw new Error("definedName error")
          } else {
            if (0 < this.formatDefinedNames.filter( (v, i) => v !== definedNames[i]).length) {
              throw new Error("definedName error")
            }
          }

          // 改ざんチェック
          const excelDataString = await this.getRangeExcelData(blob)
          if(this.formatAnswerString !== excelDataString) {
            // フォーマット違い
            this.openConfirmModal('formatDiff')
            return
          }

          // 実施番号、リビジョン
          const implNo = await this.getExcelData(blob, "implNo");
          const revision = await this.getExcelData(blob, "revesion");
          if( this.answerItems[0].answerKey.implNo !== implNo || this.answerItems[0].answerKey.revisionNo !== revision ) {
            // リビジョン、実施番号違い
            this.openConfirmModal('versionDiff')
            return
          }
          
          // 画面表示用データ、CSV用データ
          const summaryData = await this.getExcelData(blob, "ref-web-data");
          const answerData = await this.getExcelDataForCsv(blob, "ref-csv-data");
          if (summaryData === "" || answerData === "" ) {
            // フォーマット違い
            throw new Error("no contents")
          }

          this.answerSummary = this.makeSummary({ summary: summaryData });
          this.answerItems[0].summary = JSON.stringify({ summary: summaryData });
          this.answerItems[0].answer = JSON.stringify(answerData);
          this.answerItems[0].excel = btoa(this.arrayBufferToBinaryString(blob));

          this.snackbarMessage = this.$t('messageSnackBar.loadedExcel')
          this.snackbarSucceed = true
          this.openConfirmModal('uploaded')
        } catch (e) {
          this.openConfirmModal('formatDiff')
        } finally {
          Hub.dispatch('OverlayChannel', { event: 'end' })
        }
      },

      // 回答情報取得
      async getAnswer(reload=true) {
        Hub.dispatch('OverlayChannel', { event: 'start' })            
        try {
          const response =  await API.get(apiName, '/answer', {
            queryStringParameters: {
              implNo: this.getImplNo,
              companyCode: this.isAdmin ? this.getCompanyCode : undefined
            }
          })
          if (response.data.length === 0) {
            throw new Error('404')
          }
          
          if (isNaN(Number(this.getHistoryNo)) || response.data.filter(e=>e.answerKey.historyNo === Number(this.getHistoryNo)).length === 0) {
            throw new Error('404')
          }
          
          if (isNaN(Number(this.getHistoryNo)) || response.data.filter(e=>e.answerKey.historyNo === Number(this.getHistoryNo)).length === 0) {
            throw new Error('404')
          }
          
          this.answerItems = response.data
          let _page = 0
          if(!reload){
            this.answerItems.forEach((item, i) => {
              if (this.getHistoryNo == item.answerKey.historyNo) {
                _page = i
              }
            });
          }  
          this.page = _page
          this.answerSummary = this.makeSummary(JSON.parse(this.answerItems[this.page].summary))
          this.allCount = response.data.length
          
          // 一般ユーザーのみ
          if ( !this.formatAnswerString && !this.isAdmin) {
            const formatExcel = await API.get(apiName, '/question/excel', {
              queryStringParameters: {
                implNo: Number(this.getImplNo),
                revisionNo: this.answerItems[0].answerKey.revisionNo
              }
            })
            const ff = this.isJp ? formatExcel.file : formatExcel.fileEn
            if (ff === undefined || ff.length === 0) {
              throw new Error('404')
            }
            const fileData = await this.base64DecodeAsBlob(ff)
            this.formatAnswerString = await this.getRangeExcelData(fileData)
            if (this.formatAnswerString === "") {
              throw new Error('404')
            }
            this.formatAnswerRange = await this.getMaxRangeOfAllSheets(fileData)
            this.formatDefinedNames = await this.getAllDefinedNames(fileData)
          }
          this.initializeDone = true;
        } finally {
          Hub.dispatch('OverlayChannel', { event: 'end' })
        }
      },

      // 入力用紙エクセルのダウンロード
      async getFormatAnswer() {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        this.snackbarMessage = this.$t('messageSnackBar.startExcelDownload')
        this.snackbarSucceed = true
        try {
          const response = await API.get(apiName, '/question/excel', {
            queryStringParameters: {
              implNo: Number(this.getImplNo),
              revisionNo: this.answerItems[this.page].answerKey.revisionNo
            }
          });

          // ファイルのダウンロード
          if (response.file !== undefined && response.fileEn !== undefined) {
            let revisionName = ""
            const revisionTitle = this.isJp ? this.answerItems[this.page].revisionTitle : this.answerItems[this.page].revisionTitleEn
            if (revisionTitle !== undefined && revisionTitle != "") {
                revisionName = `(${revisionTitle})`
            }
            const filename = this.title(this.page) + revisionName + this.$t('answer.inputExcelSuffix') + ".xlsx"
            const blob = await this.base64DecodeAsBlob(this.isJp ? response.file : response.fileEn)
            this.dispatchDownload(blob, filename)
          }

          if (response.file.length === 0 || response.fileEn.length === 0) {
            throw new Error('404')
          }

        } finally {
            Hub.dispatch('OverlayChannel', { event: 'end' })
        }
      },

      // 過去エクセルのダウンロード
      async getHistoryAnswer() {
        Hub.dispatch('OverlayChannel', { event: 'start' })
        let target = this.answerItems[this.page].answerKey;
        if( this.answerItems[this.page].status == ANSWER.STATUS.NOT_ENTERD && 1 < this.answerItems.length ) {
          // 未入力状態で過去の履歴番号がある場合は１世代前をダウンロードする
          target = this.answerItems[1].answerKey;
        }
        this.snackbarMessage = this.$t('messageSnackBar.startAnswerExcelDownload')
        this.snackbarSucceed = true
        try {
          const response = await API.get(apiName, '/answer/excel', {
            queryStringParameters: {
              implNo: this.getImplNo,
              revisionNo: target.revisionNo,
              historyNo: target.historyNo,
              companyCode: this.isAdmin ? this.getCompanyCode : undefined
            }
          })
          // ファイルのダウンロード
          if (response.file !== undefined) {
            let revisionName = ""
            const revisionTitle = this.isJp ? target.revisionTitle : target.revisionTitleEn
            if (revisionTitle !== undefined && revisionTitle != "") {
                revisionName = `(${revisionTitle})`
            }
            const filename = `${this.title(this.page)}${revisionName}_${this.$t('common.answered')}_${target.historyNo}.xlsx`
            const blob = await this.base64DecodeAsBlob( response.file )
            this.dispatchDownload(blob, filename)
          }
          if (response.file.length === 0 ) {
            throw new Error('404')
          }
        } finally {
            Hub.dispatch('OverlayChannel', { event: 'end' })
        }
      },

      // 回答登録・更新
      async addAnswer(isSaveOnly) {
        this.overlay = true
        this.modalDisabled = true
        
        Hub.dispatch('OverlayChannel', { event: 'start' })
        await API
          .post(apiName, '/answer', {
              body: {
                answerKey: this.answerItems[0].answerKey,
                answer: this.answerItems[0].answer,
                summary: this.answerItems[0].summary,
                excel: this.answerItems[0].excel,
                status: isSaveOnly ? ANSWER.STATUS.TEMPORARY_SAVED : ANSWER.STATUS.END,
                lang: this.$i18n.locale,
              },
            })
          .then(() => {
            if (!isSaveOnly) {
               this.$router.push({ name: 'answerComplete', params: { message: this.answerItems[0].message } })
            }
            else {
              this.snackbarMessage = this.$t('messageSnackBar.tempSaveDone')
              this.snackbarSucceed = true
              this.getAnswer()
            }
          })
          .catch((error) => {
            if (error.response.status === 409) {
              this.snackbarMessage = this.$t('errorDescription.status_409')
              this.snackbarFailed = true
            }
            else {
              throw error
            }
          })
          .finally(() =>{
            this.confirmModal = false
            this.errorModal = false
            this.textModal = false
            this.overlay = false
            this.modalDisabled = false
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },

      // 回答差し戻し
      async rejectAnswer() {
        this.overlay = true
        this.modalDisabled = true

        Hub.dispatch('OverlayChannel', { event: 'start' })
        await API
          .patch(apiName, '/answer', { body: this.answerItems[0].answerKey })
          .then(() => {
              this.snackbarMessage = this.$t('messageSnackBar.questionRejectSucceed')
              this.snackbarSucceed = true
              this.getAnswer()
          })
          .catch((error) => {
            if (error.response.status === 409) {
              this.snackbarMessage = this.$t('errorDescription.status_409')
              this.snackbarFailed = true
            }
            else {
              throw error
            }
          })
          .finally(() =>{
            this.confirmModal = false
            this.textModal = false
            this.overlay = false
            this.modalDisabled = false
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })
      },

      // 再回答
      async renewAnswer(value) {
        this.overlay = true
        this.modalDisabled = true

        Hub.dispatch('OverlayChannel', { event: 'start' })
        await API
          .put(apiName, '/answer', {
          body:{
            implNo:this.answerItems[0].answerKey.implNo,
            revisionNo:	this.answerItems[0].answerKey.revisionNo,
            historyNo:this.answerItems[0].answerKey.historyNo,
            companyCode:this.answerItems[0].answerKey.companyCode,
            version:this.answerItems[0].answerKey.version,
            reason: '' !== value ? value : undefined
          }
        })
          .then(() => {
              this.snackbarMessage = this.$t('messageSnackBar.questionRenewSucceed')
              this.snackbarSucceed = true
              this.getAnswer()
          })
          .catch((error) => {
            if (error.response.status === 409) {
              this.snackbarMessage = this.$t('errorDescription.status_409')
              this.snackbarFailed = true
            }
            else {
              throw error
            }
          })
          .finally(() =>{
            this.confirmModal = false
            this.textModal = false
            this.overlay = false
            this.modalDisabled = false
            Hub.dispatch('OverlayChannel', { event: 'end' })
          })

      },

      // ページング処理
      prev() {
        if (this.page < this.allCount - 1) {
          this.page++
          this.answerSummary = this.makeSummary(JSON.parse(this.answerItems[this.page].summary))
        }
      },
      next() {
        if (this.page > 0) {
          this.page--
          this.answerSummary = this.makeSummary(JSON.parse(this.answerItems[this.page].summary))
        }
      },
      jumpFirst() {
        if (this.page < this.allCount - 1) {
          this.page = this.allCount - 1
          this.answerSummary = this.makeSummary(JSON.parse(this.answerItems[this.page].summary))
        }
      },
      jumpLast() {
        if (this.page > 0) {
          this.page = 0
          this.answerSummary = this.makeSummary(JSON.parse(this.answerItems[this.page].summary))
        }
      },

      // モーダル処理
      openConfirmModal(status) {
        this.modalStatus = status
        switch(this.modalStatus) {
          case 'save':
            this.openConfirm(this.$t('messageModal.question.temporarySavedConfirm'))
            break
          case 'done':
            this.openConfirm(this.$t('messageModal.question.savedConfirm'))
            break
          case 'download':
            if( this.isAdmin ) {
              this.openConfirm(this.$t('messageModal.question.downloadDisclaimer'), true)
            } else {
              this.modalStatus = undefined
              this.getHistoryAnswer()
            }
            break
          case 'reject':
            this.openConfirm(this.$t('messageModal.question.rejectConfirm'))
            break
          case 'renew':
            this.modalMessage = this.$t('messageModal.question.renewConfirm')
            this.textModal = true
            break
          case 'versionDiff':
            this.modalMessage = this.$t('messageModal.question.excelVersionDifference')
            this.isHtml = false
            this.errorModal = true
            break
          case 'formatDiff':
            this.modalMessage = this.$t('messageModal.question.excelFormatDifference')
            this.isHtml = false
            this.errorModal = true
            break
          case 'uploaded':
            this.modalMessage = this.$t('messageModal.question.uploaded')
            this.isHtml = true
            this.errorModal = true
            break
        }
      },
      openConfirm(msg, html=false){
        this.modalMessage = msg
        this.isHtml = html
        this.confirmModal = true
      },
      submitEvent(value) {
        switch(this.modalStatus) {
          case 'save':
            this.addAnswer(true);
            break;
          case 'done':
            this.addAnswer(false);
            break;
          case 'reject':
            this.rejectAnswer();
            break;
          case 'renew':
            this.renewAnswer(value)
            break;
          case 'download':
            this.getHistoryAnswer()
            this.confirmModal = false
            break;
        }
      },
      closeModal() {
        this.confirmModal = false
        this.errorModal = false
        this.textModal = false
      },

      // アップロード処理
      // ファイル選択イベント
      async fileChange(event) {
        const file = event.target.files[0];
        if (!file) {
          return false;
        }
        // inputデータのリセット（連続でアップロードさせるため）
        event.target.value = "";
        this.fileAnalysis(file)
      },

      // ファイルドロップイベント
      async dropFile(event) {
        const file = event.dataTransfer.files[0];
        if (!file) {
          return false;
        }
        this.fileAnalysis(file)
      },

      // ファイル解析
      fileAnalysis(file) {
        if (EXCEL_MIME_TYPE !== file.type) {
          this.openConfirmModal('formatDiff')
          return false;
        }
        const reader = new FileReader();
        reader.onload = async (e) => this.uploadFile(e.target.result);
        reader.readAsArrayBuffer(file);
      },

    }
  }
</script>

<style>
  .document-contents p {
    margin-left: 1rem;
    text-indent: -1rem
  }

  h2 > .v-card__title {
    word-break: break-word;
  }

  .invisible-btn {
    visibility:hidden;
  }
  
  .summary_area {
    overflow:auto;
    height:500px;
    display: flex;
    flex-direction: column;
  }
  
  .drop_area {
    flex-grow:1;
    color: #1976D2;
    background-color: #FFFFFF;
    font-weight: bold;
    font-size: 1.2em;
    display: flex;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 80px;
    border: 2px dashed;
    border-radius: 15px;
  }
  
  .enter {
    border: 10px dotted powderblue;
  }
  
  .frame {
    background-color: #CCDDFF;
    width: auto;
    height: auto;
    margin: 5px;
    padding: 10px;
  }

 .total {
   width: auto;
   color: #000000;
   border: 5px solid;
 }
 
 .summary_header {
   background-color: #CCDDFF;
   font-weight: bold;
   border: 1px solid;
   font-size: 0.9rem;
    display: flex;
    justify-content: center;
    align-items: center;
 }
 
 .summary_col {
   border: 1px solid;
    display: flex;
    justify-content: center;
    align-items: center;
 }
 
 .sign_col {
   text-align: left;
 }

 .summary_col_total {
   border: 1px solid;
   font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
 }
 .summary_col_subtotal {
   background-color: #dddddd00;
   border-left-width: 0px;
   border-right-width: 0px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
 }
 
 .summary_label {
   background-color: #CCDDFF;
   border: 1px solid;
   text-align: left;
   font-size: 0.9rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
 }
 
 .sign_label {
   text-align: right;
 }
 
 .summary_label_total {
   font-size: 1.2em;
   background-color: #1976D2;
   font-weight: bold;
   border: 1px solid;
    display: flex;
    justify-content: flex-start;
    align-items: center;
 }
 .summary_label_subtotal {
   background-color: #dddddd00;
   border-left-width: 0px;
   border-right-width: 0px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    height: 40px;
 }
 .summary_label_total span {
   color: #ffffff;
 }

 .no_answer {
   background-color: #ff8888;
 }
 .summary_sign_col {
   column-count: 2;
 }
 .summary_sign label {
   color: #000000!important;
 }
 .summary_sign {
   width: 80%;
   padding-bottom: 1px;
 }
 .no_sign input {
   background-color: #ff8888;
   margin-top: 5px;
   margin-left: 5px;
 }
 .complete_text {
   font-size: 1.2em;
   font-weight: bold;
   color: #FF0000;
   text-align: left;
   margin-top: 5px;
   margin-bottom: 5px;
 }
 
 .error_text {
   font-size: 1.2em;
   font-weight: bold;
   color: #FF0000;
   text-align: left;
   margin-top: 5px;
   margin-bottom: 5px;
 }
 
 div .btn {
   color: #FFFFFF;
   background-color: #1976D2;
   border-radius: 5px 5px 5px 5px;
   width: 150px;
   height: 50px;
   position: relative;
 }
 
 div .btn p {
   margin: 0;
   position: absolute;
   top: 50%;
   left: 50%;
   margin-right: -50%;
   transform: translate(-50%, -50%);
   font-family: 'Noto Sans JP', sans-serif;
 }
 
 .question-title  {
   color:#FFFFFF;
   background-color:#222277;
   padding:10px;
   position: absolute;
   left: 50%;
   transform: translate(-50%,0%);
 }
 
</style>
