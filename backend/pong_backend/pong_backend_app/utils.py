def number_to_ordinal(n):
    """
    Helper function to convert a number to an ordinal string.
    :param n:
    :return: string
    """
    if 10 <= n % 100 < 20:
        return str(n) + 'th'
    else:
        return str(n) + {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, "th")
