import JobDescriptionUploadTextArea from '@/components/jd-upload/text-area';
import BackgroundContainer from '@/components/common/background-container';
import { Suspense } from 'react';

const ProvideJobDescriptionsPage = () => {
	return (
		<BackgroundContainer>
			<div className="flex flex-col items-center justify-center max-w-7xl">
				<h1 className="text-6xl font-bold text-center mb-12 text-cyan-300 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
					提供工作描述
				</h1>
				<p className="text-center text-gray-300 text-xl mb-8 max-w-xl mx-auto leading-relaxed">
					请在下方粘贴最多三个工作描述。我们将使用这些来与您的简历进行比较并找到最佳匹配。
				</p>
				<Suspense fallback={<div className="text-cyan-300 animate-pulse">正在加载输入框...</div>}>
					<JobDescriptionUploadTextArea />
				</Suspense>
			</div>
		</BackgroundContainer>
	);
};

export default ProvideJobDescriptionsPage;
