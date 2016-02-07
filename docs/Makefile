
manual.pdf: manual.tex
	pdflatex $<
	pdflatex $<

manual.tex: manual.md manual_header.tex manual_titlepage.tex manual_footer.tex
	pandoc -f markdown_github -t latex -H manual_header.tex -B manual_titlepage.tex -o $@ manual.md
	sed -i -e s/@{}//g $@
	sed -i -e s/{lll}/{p{1in}p{1in}p{3.85in}}/g $@
	sed -i -e s/{ll}/{p{1in}p{5in}}/g $@
