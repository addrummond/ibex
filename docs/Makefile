
manual.pdf: manual.tex
	pdflatex $<
	pdflatex $<

manual.tex: manual.md manual_header.tex manual_titlepage.tex manual_footer.tex
	pandoc -f markdown_github -t latex -H manual_header.tex -B manual_titlepage.tex -o $@ manual.md
	sed -i -e s/@{}//g $@
	sed -i -e s/{lll}/{p{1.7in}p{1in}p{3.15in}}/g $@
	sed -i -e s/{ll}/{p{1.7in}p{4.3in}}/g $@
	sed -i -e 's/\\begin{longtable}/\\begin{RaggedRight}\\small\\begin{longtable}/g' $@
	sed -i -e 's/\\end{longtable}/\\end{longtable}\\normalsize\\end{RaggedRight}/g' $@
