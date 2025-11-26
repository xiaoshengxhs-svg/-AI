import React, { useState, useRef } from 'react';
import { MediaType, ProcessState, UploadedFile } from './types';
import { Upload, ImageIcon, Video, Wand2, Download, Trash2, Loader2, AlertCircle, X } from './components/Icons';
import ComparisonSlider from './components/ComparisonSlider';
import { fileToBase64, removeWatermarkFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MediaType>(MediaType.PHOTO);
  const [processState, setProcessState] = useState<ProcessState>({ status: 'IDLE' });
  const [fileData, setFileData] = useState<UploadedFile | null>(null);
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (type: MediaType) => {
    setActiveTab(type);
    resetState();
  };

  const resetState = () => {
    setProcessState({ status: 'IDLE' });
    setFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Basic validation
    if (activeTab === MediaType.PHOTO && !file.type.startsWith('image/')) {
      alert('请上传图片文件 (JPG, PNG, WEBP)');
      return;
    }
    if (activeTab === MediaType.VIDEO && !file.type.startsWith('video/')) {
      alert('请上传视频文件 (MP4, WEBM)');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFileData({ file, previewUrl });
    setProcessState({ status: 'IDLE', originalUrl: previewUrl });
  };

  const processMedia = async () => {
    if (!fileData) return;

    if (activeTab === MediaType.VIDEO) {
        // Mock implementation for video as current stable API doesn't support video inpainting easily on frontend
        // In a real app, this would poll a backend.
        setProcessState({ status: 'PROCESSING', originalUrl: fileData.previewUrl });
        setTimeout(() => {
             setProcessState({ 
                 status: 'ERROR', 
                 originalUrl: fileData.previewUrl,
                 error: "视频去水印功能正在升级中，目前仅支持图片去水印。请尝试上传图片体验！"
             });
        }, 2000);
        return;
    }

    try {
      setProcessState({ status: 'PROCESSING', originalUrl: fileData.previewUrl });
      
      const base64Data = await fileToBase64(fileData.file);
      const processedBase64 = await removeWatermarkFromImage(base64Data, fileData.file.type);
      
      const processedUrl = `data:${fileData.file.type};base64,${processedBase64}`;
      
      setProcessState({
        status: 'SUCCESS',
        originalUrl: fileData.previewUrl,
        processedUrl: processedUrl
      });
    } catch (error: any) {
      console.error(error);
      setProcessState({
        status: 'ERROR',
        originalUrl: fileData.previewUrl,
        error: error.message || "处理失败，请稍后重试"
      });
    }
  };

  const downloadImage = () => {
    if (processState.processedUrl) {
      const link = document.createElement('a');
      link.href = processState.processedUrl;
      link.download = `cleanlens_cleaned_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-brand-500 selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                CleanLens AI
                </h1>
            </div>
            <div className="text-sm text-slate-400 hidden sm:block">
                Powered by Google Gemini 2.5
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                智能移除<span className="text-brand-500">水印</span>与<span className="text-purple-500">杂物</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                上传您的照片或视频，让 AI 自动识别并擦除不需要的元素，还原画面本真。
            </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-800/80 p-1 rounded-xl inline-flex shadow-lg border border-slate-700">
                <button
                    onClick={() => handleTabChange(MediaType.PHOTO)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === MediaType.PHOTO
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>图片去水印</span>
                </button>
                <button
                    onClick={() => handleTabChange(MediaType.VIDEO)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === MediaType.VIDEO
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                    <Video className="w-4 h-4" />
                    <span>视频去水印</span>
                    <span className="ml-1 text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">Beta</span>
                </button>
            </div>
        </div>

        {/* Comparison Result View (If Success) */}
        {processState.status === 'SUCCESS' && processState.originalUrl && processState.processedUrl && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                 <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <h3 className="text-xl font-semibold text-white">处理结果对比</h3>
                    <div className="flex space-x-3">
                        <button 
                            onClick={resetState}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>重新上传</span>
                        </button>
                        <button 
                            onClick={downloadImage}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-900/20 transition-all hover:scale-105"
                        >
                            <Download className="w-4 h-4" />
                            <span>下载图片</span>
                        </button>
                    </div>
                </div>

                <ComparisonSlider 
                    beforeImage={processState.originalUrl} 
                    afterImage={processState.processedUrl} 
                />
            </div>
        )}

        {/* Upload Area (If not Success) */}
        {processState.status !== 'SUCCESS' && (
             <div className="max-w-3xl mx-auto">
                {/* Upload Box */}
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`relative group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
                        fileData 
                        ? 'border-brand-500/50 bg-slate-800/30' 
                        : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/50 bg-slate-800/20'
                    }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={activeTab === MediaType.PHOTO ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                    />

                    {!fileData ? (
                        <div className="space-y-4">
                            <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-slate-700">
                                <Upload className="w-10 h-10 text-slate-400 group-hover:text-brand-400 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    点击上传或拖拽文件到这里
                                </h3>
                                <p className="text-slate-400 mt-2 text-sm">
                                    {activeTab === MediaType.PHOTO 
                                        ? '支持 JPG, PNG, WEBP 等格式'
                                        : '支持 MP4, MOV, WEBM 等格式 (最大 50MB)'
                                    }
                                </p>
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-900/20"
                            >
                                选择文件
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preview */}
                            <div className="relative inline-block rounded-lg overflow-hidden border border-slate-700 shadow-xl max-h-[300px]">
                                {activeTab === MediaType.PHOTO ? (
                                    <img 
                                        src={fileData.previewUrl} 
                                        alt="Preview" 
                                        className="max-h-[300px] w-auto object-contain"
                                    />
                                ) : (
                                    <video 
                                        src={fileData.previewUrl}
                                        className="max-h-[300px] w-auto"
                                        controls
                                    />
                                )}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resetState();
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex justify-center">
                                {processState.status === 'PROCESSING' ? (
                                    <button 
                                        disabled
                                        className="flex items-center space-x-2 px-8 py-3 rounded-lg bg-brand-600/50 text-white cursor-not-allowed"
                                    >
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>AI 正在处理中...</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={processMedia}
                                        className="group relative flex items-center space-x-2 px-8 py-3 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-brand-900/30 transition-all hover:scale-105"
                                    >
                                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span>开始去水印</span>
                                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] animate-shimmer" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {processState.status === 'ERROR' && processState.error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                        <span>{processState.error}</span>
                    </div>
                )}
             </div>
        )}
      </main>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Wand2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">智能识别</h3>
                <p className="text-slate-400">
                    无需手动涂抹，Gemini 2.5 Vision 模型自动识别画面中的水印、Logo 与多余文字。
                </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">无损画质</h3>
                <p className="text-slate-400">
                    利用生成式 AI 技术填补背景，保持原图分辨率与纹理细节，处理痕迹自然无违和感。
                </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">多格式支持</h3>
                <p className="text-slate-400">
                    全面支持 JPG, PNG, WEBP 等主流图片格式。视频去水印功能正在测试中，敬请期待。
                </p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default App;