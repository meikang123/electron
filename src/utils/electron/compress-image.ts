import { nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'

interface ResultData {
  success: boolean;
  msg: string;
  reason?: any;
}

const mkdir = (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    if(fs.existsSync(path)) {
      resolve(true)
      return
    }

    fs.mkdir(path, (error) => {
      if(error) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

const imageCompress = (path: string, quality = 50) => {
  const image = nativeImage.createFromPath(path)
  const res = image.resize({
    // 图片压缩质量，可选值：better || good || best
    quality: 'best'
  })
  return res.toJPEG(quality)
}

export default async (options: any): Promise<ResultData> => {
  const isCreateDir = await mkdir(options.targetDir)
  if(!isCreateDir) return {
    success: false,
    msg: '创建图片保存目录失败！'
  }

  try {
    options.fileList.map((item: any) => {
      const dirParse = path.parse(item)
      const data = imageCompress(item, options.quality)
      const targetDir = `${options.targetDir}${path.sep}${dirParse.name}${dirParse.ext}`
      fs.writeFileSync(targetDir,data)
    })
    return {
      success: true,
      msg: `图片压缩成功，保存在 ${options.targetDir} 目录中！`
    }
  } catch (err) {
    return {
      success: false,
      msg: '图片压缩失败！',
      reason: err
    }
  }
}
