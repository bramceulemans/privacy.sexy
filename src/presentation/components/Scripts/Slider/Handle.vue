<template>
    <div
        class="handle"
        :style="{ cursor: cursorCssValue }"
        @mousedown="startResize">
        <div class="line"></div>
        <font-awesome-icon
            class="image"
            :icon="['fas', 'arrows-alt-h']" 
        /> <!-- exchange-alt arrows-alt-h-->
        <div class="line"></div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Handle extends Vue {
    public readonly cursorCssValue = 'ew-resize';
    private initialX: number = undefined;

    public startResize(event: MouseEvent): void {
        this.initialX = event.clientX;
        document.body.style.setProperty('cursor', this.cursorCssValue);
        document.addEventListener('mousemove', this.resize);
        window.addEventListener('mouseup', this.stopResize);
        event.stopPropagation();
        event.preventDefault();
    }
    public resize(event: MouseEvent): void {
        const displacementX = event.clientX - this.initialX;
        this.$emit('resized', displacementX);
        this.initialX = event.clientX;
    }
    public stopResize(): void {
        document.body.style.removeProperty('cursor');
        document.removeEventListener('mousemove', this.resize);
        window.removeEventListener('mouseup', this.stopResize);
    }
}

</script>

<style lang="scss" scoped>
@import "@/presentation/styles/colors.scss";

.handle {
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    &:hover {
        .line {
            background: $gray;
        }
        .image {
            color: $gray;
        }
    }
    .line {
        flex: 1;
        background: $dark-gray;
        width: 3px;
    }
    .image {
        color: $dark-gray;
    }
    margin-right: 10px;
}
</style>
