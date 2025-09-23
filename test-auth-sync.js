// 测试脚本：验证cookie存储和读取
document.addEventListener('DOMContentLoaded', function() {
    // 检查cookie中是否有用户数据
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const userData = getCookie('carbon-user-storage');
    console.log('Cookie中的用户数据:', userData);

    if (userData) {
        try {
            const parsed = JSON.parse(decodeURIComponent(userData));
            console.log('解析后的用户数据:', parsed);
            console.log('用户是否登录:', parsed.state?.isLoggedIn);
            console.log('用户信息:', parsed.state?.user);
        } catch (e) {
            console.error('解析用户数据失败:', e);
        }
    }
});