// 获取页面元素
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const preview = document.getElementById('preview');
const mergedCanvas = document.getElementById('mergedCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const invertCheckbox = document.getElementById('invertColors');

let images = [];

// 点击上传区域触发文件选择
dropZone.addEventListener('click', () => fileInput.click());

// 处理文件选择（任意数量）
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 拖拽上传功能
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#3498db';
    dropZone.style.backgroundColor = '#ecf0f1';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#95a5a6';
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#95a5a6';
    dropZone.style.backgroundColor = '';
    handleFiles(e.dataTransfer.files);
});

// 处理上传的图片
function handleFiles(files) {
    if (files.length === 0) return;
    
    images = Array.from(files);
    preview.innerHTML = '';
    
    // 加载所有图片
    const imagePromises = images.map(file => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // 显示预览图
                const previewImg = document.createElement('img');
                previewImg.src = img.src;
                preview.appendChild(previewImg);
                resolve(img);
            };
            img.src = URL.createObjectURL(file);
        });
    });

    // 合并图片
    Promise.all(imagePromises).then(loadedImages => {
        mergeImages(loadedImages);
        downloadBtn.disabled = false;
    });
}

// 合并图片函数
function mergeImages(imgs) {
    const ctx = mergedCanvas.getContext('2d');
    const width = imgs[0].width;
    const height = imgs[0].height;
    
    // 设置画布尺寸
    mergedCanvas.width = width;
    mergedCanvas.height = height;
    
    // 填充白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // 正片叠底模式合并
    ctx.globalCompositeOperation = 'multiply';
    imgs.forEach(img => {
        ctx.drawImage(img, 0, 0, width, height);
    });
    
    // 颜色反转处理
    if (invertCheckbox.checked) {
        applyInvertEffect();
    }
}

// 颜色反转函数
function applyInvertEffect() {
    const ctx = mergedCanvas.getContext('2d');
    const width = mergedCanvas.width;
    const height = mergedCanvas.height;
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];       // 红色通道
        data[i + 1] = 255 - data[i + 1]; // 绿色通道
        data[i + 2] = 255 - data[i + 2]; // 蓝色通道
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// 颜色反转复选框事件
invertCheckbox.addEventListener('change', () => {
    if (images.length > 0) {
        mergeImages(images.map(img => {
            const newImg = new Image();
            newImg.src = img.src;
            return newImg;
        }));
    }
});

// 下载功能
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'merged-image.png';
    link.href = mergedCanvas.toDataURL('image/png');
    link.click();
});