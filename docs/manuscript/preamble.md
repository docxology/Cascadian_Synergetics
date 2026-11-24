# LaTeX preamble

Packages and settings for the rendered PDF. The docxology/template renderer
reads the fenced block below into the combined document's preamble.

```latex
% Mathematics. The template expects the theorem environments and listings to be
% declared here, and adds and warns about any that are missing.
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{amsthm}
\newtheorem{theorem}{Theorem}[section]
\newtheorem{remark}[theorem]{Remark}
\newtheorem{example}[theorem]{Example}
\usepackage{listings}
\lstset{basicstyle=\ttfamily\small,breaklines=true,columns=fullflexible}

% Layout
\usepackage{geometry}
\geometry{margin=1in,includefoot}
\usepackage{float}
\usepackage{graphicx}

% Tables
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{array}

% Typography
\usepackage{microtype}
\usepackage{xcolor}
\definecolor{grove}{HTML}{2E5E4E}

% Cross-references and citations. Addresses print in the text face and may
% break after a hyphen as well as a slash.
\PassOptionsToPackage{hyphens}{url}
\usepackage{hyperref}
\urlstyle{same}
\hypersetup{
    colorlinks=true,
    allcolors=grove
}
\usepackage[capitalise,noabbrev]{cleveref}
\usepackage{natbib}
```
