<template>
  <section class="section">
    <div class="tips">
      <p>1. 只能压缩 <span class="highlight">jpg/png</span> 格式图片；</p>
      <p>2. 一次最多压缩<span class="highlight">100张</span>；</p>
      <p>3. 未选择目录、压缩后的文件会保存在<span class="highlight">最后一张图片路径下的image-compress文件夹</span>中, 请留意成功后的提示；</p>
      <p>4. image-compress文件夹中如果有同名文件，将被<span class="highlight">覆盖</span>；</p>
      <p>5. 图片处理需要时间，点击压缩后请耐心等待片刻。</p>
    </div>
    <div class="header">
      <span class="label">压缩质量：</span>
      <div class="box">
        <el-slider v-model="quality" :step="10" :min="10" show-stops :marks="getMarks()" />
      </div>
    </div>

    <div class="dir">
      <el-input placeholder="保存文件目录" v-model="targetDir">
        <template #prepend>
          <span @click="changeDir">选择图片保存目录</span>
        </template>
      </el-input>
      <el-button style="margin-left: 24px" type="success" @click="imgCompress">开始压缩</el-button>
    </div>

    <div class="content">
      <el-upload
          accept=".jpg,.png"
          ref="upload"
          multiple
          :auto-upload="false"
          :limit="maxFileNum"
          :file-list="fileList"
          :on-exceed="handleExceed"
          :on-change="handleChangeFile"
          action=""
          list-type="picture-card"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, unref, onUnmounted } from 'vue';
import { ipcRenderer } from 'electron'
import path from 'path'
import { ElSlider, ElInput, ElButton, ElUpload, ElMessage, ElLoading, ElNotification } from 'element-plus'
import type { ILoadingInstance } from 'element-plus/packages/loading/src/loading.type'

let loadingInstance: ILoadingInstance | null = null;

export default defineComponent({
  name: "ImageCompress",

  components: { ElSlider, ElInput, ElButton, ElUpload },

  setup() {

    // 文件列表
    const fileList = ref([]);

    //文件处理个数限制
    const maxFileNum = ref(100);

    // 图片压缩质量
    const quality = ref(50)

    // 图片保存目录
    const isDir = ref(false)
    const targetDir = ref('')

    // 图片选择组件
    const upload = ref<typeof ElUpload | null>(null);

    // 压缩质量选项
    const getMarks = () => {
      const marks: {[propName: number]: string} = {};
      for(let i = 10; i <= 100; i += 10) {
        marks[i] = i.toString()
      }
      return marks
    }

    // 文件数量超出处理
    const handleExceed = (files: string[], fileList: string[]) => {
      ElMessage.warning({
        message: `最多只能选择 ${ unref(maxFileNum) }个文件哦，当前选择了 ${files.length + fileList.length} 个文件`,
        type: "warning"
      });
    };

    // 压缩目录不存在取当前压缩文件目录
    const handleChangeFile = (file: any) => {
      if(!unref(isDir)) {
        const parseUrl = path.parse(file.raw.path);
        targetDir.value = parseUrl.dir + `${path.sep}image-compress`;
      }
    };

    //选择目录
    let isOpen = false
    const changeDir = () => {
      if(!isOpen) {
        isOpen = true
        ipcRenderer.invoke('open-directory').then(result => {
          isOpen = false;
          if(result) {
            targetDir.value = result;
            isDir.value = true;
          }
        })
      }
    }

    // 开始压缩
    const imgCompress = () => {
      const uploadFiles = (unref(upload) as typeof ElUpload).uploadFiles;
      if(!unref(uploadFiles).length) { // 未选择压缩文件
        ElNotification({
          title: "提示",
          message: "请先选择压缩文件！",
          type: "warning"
        })
        return false
      }
      const dir = path.normalize(unref(targetDir))
      const list: string[] = unref(uploadFiles).map((item: any) => item?.raw?.path)

      // 显示loading
      loadingInstance = ElLoading.service({
        background: "rgba(255,255,255,0.5)"
      });
      ipcRenderer.invoke('compress-image', { targetDir: dir, fileList: list, quality: unref(quality) }).then(result => {
        ElNotification({
          title: result.success ? "成功" : "失败",
          message: result.success ? result.msg : result.reason,
          type: result.success ? "success" : "error"
        });
        (loadingInstance as ILoadingInstance).close();
        if (result.success) {
          fileList.value = [];
          quality.value = 50;
          targetDir.value = '';
        }
      })
    }

    onUnmounted(() => {
      loadingInstance = null
    })

    return {
      quality,
      upload,
      getMarks,
      targetDir,
      changeDir,
      imgCompress,
      fileList,
      maxFileNum,
      handleExceed,
      handleChangeFile
    }
  }
});
</script>

<style lang="scss" scoped>
.section {
  padding: 15px; height: 100%; background: #F2F3F4;
  .tips {
    line-height: 24px; font-size: 14px;
    .highlight {
      color: #F56C6C;
    }
  }
  .header {
    display: flex; padding-top: 20px; align-items: center;
    .label {
      font-size: 14px; margin-right: 10px;
    }
    .box {
      flex: 1;
    }
  }
  .dir {
    display: flex; padding-top: 30px; align-items: center; margin-bottom: 20px;
  }
  .content {
    display: flex; justify-content: center; border: 1px dashed #d9d9d9; border-radius: 15px; padding: 15px;
  }
}
</style>
