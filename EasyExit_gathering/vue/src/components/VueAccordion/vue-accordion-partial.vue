<template>
	<li :style="liStyles">
		<a :href="item.url" :style="aStyles">
			<!-- <h1 v-text="item.title" :style="h1Styles"></h1> -->
			<div v-for="section in item.sections">
				<h3 v-text="section.title" :style="h2Styles"></h3>
				<p v-text="section.text" :style="pStyles"></p>
			</div>
		</a>
	</li>
</template>
<script>
	export default {
		props: {
			item: {
				type: Object
			},
			styles: {
				type: Object
			}
		},
		computed: {
			liStyles() {
				const li = {
					backgroundImage: 'url(' + this.item.image + ')'
				};

				if(this.styles && this.styles.li)
					Object.assign(li, this.styles.li);

				return li;
			},
			aStyles() {
				return this.styles && this.styles.a ? this.styles.a : {};
			},
			h1Styles() {
				return this.styles && this.styles.h1 ? this.styles.h1 : {};
			},
			h2Styles() {
				return this.styles && this.styles.h2 ? this.styles.h2 : {};
			},
			pStyles() {
				return this.styles && this.styles.p ? this.styles.p : {};
			}
		}
	}
</script>
<style scoped>
	.vue-accordion ul li {
		display: table-cell;
		vertical-align: bottom;
		position: relative;
		width: 50%;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: contain;
		transition: all 500ms ease;
		height: 100%;
    }

    .vue-accordion ul li a {
		display: block;
		width: 100%;
		position: relative;
		z-index: 3;
		vertical-align: bottom;
		padding: 15px 20px;
		box-sizing: border-box;
		color: #fff;
		text-decoration: none;
		transition: all 200ms ease;
		height: 100%;
		overflow-y: scroll;
    }

    .vue-accordion ul li a * {
		opacity: 0;
		margin: 0;
		width: 100%;
		text-overflow: ellipsis;
		position: relative;
		z-index: 5;
		/*white-space: nowrap;*/
		/*overflow: hidden;*/
		-webkit-transform: translateX(-20px);
		transform: translateX(-20px);
		-webkit-transition: all 400ms ease;
		transition: all 400ms ease;
    }

		.vue-accordion ul li a h3 {
			margin: 15px 0;
		}

    .vue-accordion ul li a h2 {
		/*text-overflow: clip;
		font-size: 24px;
		text-transform: uppercase;*/
		/*margin-bottom: 2px;*/
		/*margin: 10px 0;*/
    }

    .vue-accordion ul li a p {
		/*font-size: 13.5px;*/
    }

    .vue-accordion ul:hover li { width: 15%; }

    .vue-accordion ul:hover li:hover { width: 60%; }

    .vue-accordion ul:hover li:hover a { background: rgba(255, 255, 255, 0.8); }

    .vue-accordion ul:hover li:hover a * {
		opacity: 1;
		-webkit-transform: translateX(0);
		transform: translateX(0);
    }
</style>
