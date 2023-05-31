// bad
if (this.props.dialogVisible) {

}

// good
const { dialogVisible } = this.props
if (dialogVisible) {
}
