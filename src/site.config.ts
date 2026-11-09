import { defineSolitudeConfig } from './lib/config';

const avatar = '/img/avatar.png';

export default defineSolitudeConfig({
  site: 'https://penguinway.github.io',
  title: '企鹅的小站',
  description: '记录开发、网络安全与服务器折腾的个人博客',
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  // 正文以中文为主，按 CJK 字符计字数/阅读时间，与原站统计口径更接近。
  hasCJKLanguage: true,
  author: { name: 'Penguin' },
  menus: [
    {
      name: '文章',
      children: [
        { name: '归档', url: '/archives/', icon: 'fas fa-folder-closed' },
        { name: '分类', url: '/categories/', icon: 'fas fa-clone' },
        { name: '标签', url: '/tags/', icon: 'fas fa-tags' },
        { name: '追番', url: '/bangumis/', icon: 'fas fa-tv' },
      ],
    },
    {
      name: '友链',
      children: [
        { name: '友人帐', url: '/links/', icon: 'fas fa-user-group' },
        { name: '留言板', url: '/message/', icon: 'fas fa-comments' },
      ],
    },
    {
      name: '关于',
      children: [
        { name: '关于本人', url: '/about/', icon: 'fas fa-paper-plane' },
      ],
    },
  ],
  theme: {
    site: { name: { class: 'text', custom: '企鹅的小站' }, icon: avatar },
    lightbox: 'fancybox',
    // 与原站一致使用蓝色强调色：浅色主题为主题蓝，深色主题用浅蓝保证正文链接可读。
    theme_color: {
      light: '#425aef',
      dark: '#8ea6ff',
    },
    hometop: {
      recommendList: [
        {
          title: '2023贡橙杯CTF院赛Write-UP',
          url: '/posts/53360.html',
          label: '荐',
        },
        {
          title: 'Electron音视频播放器开发踩坑',
          url: '/posts/62818.html',
          label: '荐',
        },
        {
          title: 'Electron音视频播放器开发踩坑2',
          url: '/posts/15605.html',
          label: '荐',
        },
      ],
    },
    aside: {
      home: { noSticky: 'about', Sticky: 'allInfo' },
      post: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      page: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      my_card: {
        author: { img: avatar },
        description: '记录开发、网络安全与服务器折腾的个人博客',
        content: '蒟蒻瑟瑟发抖~',
        witty_words: ['Happy Life~'],
        information: [
          {
            name: 'GitHub',
            url: 'https://github.com/penguinway',
            icon: 'fab fa-github',
          },
          {
            name: 'Email',
            url: 'mailto:penguinloveyousa@gmail.com',
            icon: 'fas fa-envelope',
          },
        ],
      },
      siteinfo: { runtime: '2022-01-01 00:00:00' },
    },
    footer: {
      information: {
        author: avatar,
        left: [
          {
            name: 'GitHub',
            url: 'https://github.com/penguinway',
            icon: 'fab fa-github',
          },
        ],
        right: [{ name: 'RSS', url: '/index.xml', icon: 'fas fa-rss' }],
      },
      group: {
        导航: [
          { name: '归档', url: '/archives/' },
          { name: '分类', url: '/categories/' },
          { name: '标签', url: '/tags/' },
        ],
        关于: [
          { name: '关于本人', url: '/about/' },
          { name: '友人帐', url: '/links/' },
        ],
      },
      beian: [
        { name: '赣ICP备2022008380号', url: 'https://beian.miit.gov.cn/' },
      ],
    },
    // 示例歌单不是站长的，先关闭；评论服务未接入（旧站 twikooEnvId 为空）。
    capsule: { enable: false },
    post: {
      meta: { locate: false },
      // 统一使用本地中性封面；不启用封面取色，避免整站强调色被单张封面图带偏。
      covercolor: { enable: false, mode: 'local' },
      default: {
        cover: ['/img/cover-default.avif'],
        copyright: { author: avatar },
      },
    },
    brevity: { enable: false },
    keyboard: {
      enable: true,
      list: [
        { modifier: 'shift', key: 'D', action: 'toggleTheme' },
        { modifier: 'mod', key: 'F', action: 'openSearch' },
        { modifier: 'shift', key: 'K', action: 'toggleKeyboard' },
      ],
    },
    search: { tags: ['CTF', '开发', '服务器'], local: { preload: true } },
    pwa: { enable: true },
  },
});
