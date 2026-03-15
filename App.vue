<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		onLaunch() {
		    // 创建全局事件总线
		    uni.$global = uni.$global || {};
		    
		    // 添加路由监听
		    const methods = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'];
		    methods.forEach(method => {
		      uni.addInterceptor(method, {
		        invoke(args) {
		          uni.$emit('routeChange');
		          return args;
		        },
		        success() {
		          uni.$emit('routeChange');
		        },
		        fail(err) {
		          console.error(`${method} 失败:`, err);
		        }
		      });
		    });
		  }
	}
	
</script>

<style>
	/*每个页面公共css */
</style>
